<template>
  <div id="home">
    <div class="header">
      <div class="header_left">后台管理</div>
      <div class="header_right">
        <div class="header_right_username">欢迎! {{ username }}</div>
        <el-button type="primary">注销</el-button>
      </div>
    </div>
    <div class="main">
      <div class="main_item nav">
        <el-menu
          default-active="1"
        >
          <el-submenu index="1" @click.native="onDataCenterClick">
            <template slot="title">
              <i class="el-icon-s-home"></i>
              <span>数据中心</span>
            </template>
            <el-submenu v-for="(item, index) in status.nodes" :key="index" :index="`1-${index.toString()}`" @click.native="onNodeCenterClick(index, $event)">
              <template slot="title">
                <i class="el-icon-s-data"></i>
                <span>{{ item.name }}</span>
              </template>
              <el-menu-item v-for="(menuitem, menuitemindex) in item.nodes" :key="menuitemindex" :index="`1-${index.toString()}-${menuitemindex.toString()}`" @click.native="onNodeClick(index, menuitemindex, $event)">
                <div style="display: flex; align-items: center;">
                  <i v-if="menuitem.status == 'running'" class="el-icon-caret-right" style="color: #21BF4B;"/>
                  {{ menuitem.name }}
                </div>
              </el-menu-item>
            </el-submenu>
          </el-submenu>
        </el-menu>
      </div>
      <div class="main_item content">
        <data-center v-if="contentType == 0" :status="status"></data-center>
        <node-center v-if="contentType == 1" :status="nodeCenterStatus"></node-center>
        <node v-if="contentType == 2" :status="nodeStaus"></node>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios'
import { STROGE, API } from '@/constants'
import { DataCenter, NodeCenter, Node } from './homeViews' 

export default {
  name: 'Home',
  components: {
    'data-center': DataCenter,
    'node-center': NodeCenter,
    'node': Node
  },
  data() {
    return {
      username: '',
      status: {
        health: {
          status: true,
          nodes: {
            online: 0,
            offline: 0
          }
        },
        visitor: {
          qemu: {
            running: 0,
            stopped: 0,
          },
          lxc: {
            running: 0,
            stopped: 0,
          }
        },
        resource: {
          cpu: 0,
          maxcpu: 0,
          mem: 0,
          maxmem: 0,
          disk: 0,
          maxdisk: 0,
          cpuUsage: '',
          memUsage: '',
          diskUsage: ''
        },
        nodes: []
      },
      nodeCenterStatus: {
        status: {},
        rrdata: []
      },
      selectNodeCenter: '',
      nodeStaus: {
        status: {},
        rrdata: []
      },
      selectNode: '',
      contentType: -1,
      timeoutList: []
    }
  },
  methods: {
    onDataCenterClick() {
      this.clearAllTimeout()
      this.dataCenterRequest()
    },
    onNodeCenterClick(index, e) {
      this.clearAllTimeout()
      this.selectNodeCenter = this.status.nodes[index].node
      this.nodeCenterRequest()
      e.stopPropagation()
    },
    onNodeClick(centerIndex, nodeIndex, e) {
      this.clearAllTimeout()
      this.selectNodeCenter = this.status.nodes[centerIndex].node
      this.selectNode = this.status.nodes[centerIndex].nodes[nodeIndex].id
      this.nodeRequest()
      e.stopPropagation()
    },
    clearAllTimeout() {
      for (let item of this.timeoutList) {
        clearTimeout(item)
      }
      this.timeoutList = []
    },
    async getStatusData() {
      const res = await axios.get(API.CLUSTER_STATUS)
      if (res) {
        const _nodes = []
        for (let item of res.data.data) {
          const {name, online, ip, nodeid} = item
          _nodes.push({
            name,
            online,
            ip,
            nodeid,
            nodes: []
          })
        }
        this.status.nodes = _nodes
      }
    },
    async getResourcesData() {
      const res = await axios.get(API.CLUSTER_RESOURCES)
      if (res) {
        const nodesMap = new Map()
        this.status.nodes.forEach((item, index) => {
          nodesMap.set(item.name, index)
        });
        const visitor = {
          qemu: {
            running: 0,
            stopped: 0,
          },
          lxc: {
            running: 0,
            stopped: 0,
          }
        }
        const nodeHealth = {
          online: 0,
          offline: 0
        }
        const resourceUsage = {
          cpu: 0,
          maxcpu: 0,
          mem: 0,
          maxmem: 0,
          disk: 0,
          maxdisk: 0,
          cpuUsage: '',
          memUsage: '',
          diskUsage: ''
        }
        for (let item of res.data.data) {
          switch(item.type) {
            case "node":
              // eslint-disable-next-line no-case-declarations
              let node = this.status.nodes[nodesMap.get(item.node)]
              node = { ...node, ...item }
              node.cpuUsage = (item.cpu * 100).toFixed(1)
              node.memUsage = (item.mem / item.maxmem * 100).toFixed(1)
              node.diskUsage = (item.disk / item.maxdisk * 100).toFixed(1)
              this.$set(this.status.nodes, nodesMap.get(item.node), node)
              if (item.status === "online") {
                nodeHealth.online++
              } else {
                nodeHealth.offline++
              }
              resourceUsage.cpu += item.cpu
              resourceUsage.maxcpu += item.maxcpu
              resourceUsage.mem += item.mem
              resourceUsage.maxmem += item.maxmem
              resourceUsage.disk += item.disk
              resourceUsage.maxdisk += item.maxdisk
              break
            case "qemu":
              if (item.status === 'running') {
                visitor.qemu.running++
              } else {
                visitor.qemu.stopped++
              }
              this.status.nodes[nodesMap.get(item.node)].nodes.push(item)
              break
            case "lxc":
              if (item.status === 'running') {
                visitor.lxc.running++
              } else {
                visitor.lxc.stopped++
              }
              this.status.nodes[nodesMap.get(item.node)].nodes.push(item)
              break
            case "stroge":
              this.status.nodes[nodesMap.get(item.node)].nodes.push(item)
              break
            default:
              break
          }
        }
        this.status.visitor = visitor
        this.status.health.nodes = nodeHealth
        resourceUsage.cpuUsage = (resourceUsage.cpu * 100).toFixed(1)
        resourceUsage.memUsage = (resourceUsage.mem / resourceUsage.maxmem * 100).toFixed(1)
        resourceUsage.diskUsage = (resourceUsage.disk / resourceUsage.maxdisk * 100).toFixed(1)
        this.status.resource = resourceUsage
      }
    },
    async getNodeCenterStatusData() {
      const res = await axios.get(`/api2/json/nodes/${this.selectNodeCenter}/status`)
      if (!res) {
        return
      }
      const data = res.data.data
      this.nodeCenterStatus.status = data
    },
    async getNodeCenterRRdata() {
      const res = await axios.get(`/api2/json/nodes/${this.selectNodeCenter}/rrddata?timeframe=hour&cf=AVERAGE`)
      if (!res) {
        return
      }
      const data = res.data.data
      this.nodeCenterStatus.rrdata = data
    },
    async getNodeStatusData() {
      const res = await axios.get(`/api2/json/nodes/${this.selectNodeCenter}/${this.selectNode}/status/current`)
      if (!res) {
        return
      }
      const data = res.data.data
      this.nodeStaus.status = data
    },
    async getNodeRRdata() {
      const res = await axios.get(`/api2/json/nodes/${this.selectNodeCenter}/${this.selectNode}/rrddata?timeframe=hour&cf=AVERAGE`)
      if (!res) {
        return
      }
      const data = res.data.data
      this.nodeStaus.rrdata = data
    },
    dataCenterRequest() {
      this.contentType = 0
      const tf = async () => {
        await this.getStatusData()
        await this.getResourcesData()
        if (this.contentType == 0) {
          this.timeoutList.push(setTimeout(() => { tf() }, 5000))
        }
      }
      tf()
    },
    nodeCenterRequest() {
      this.contentType = 1
      const tf = async () => {
        await this.getNodeCenterStatusData()
        if (this.contentType == 1) {
          this.timeoutList.push(setTimeout(() => { tf() }, 5000))
        }
      }
      const tf1 = async () => {
        await this.getNodeCenterRRdata()
        if (this.contentType == 1) {
          this.timeoutList.push(setTimeout(() => { tf1() }, 10000))
        }
      }
      tf()
      tf1()
    },
    nodeRequest() {
      this.contentType = 2
      const tf = async () => {
        await this.getNodeStatusData()
        if (this.contentType == 2) {
          this.timeoutList.push(setTimeout(() => { tf() }, 5000))
        }
      }
      const tf1 = async () => {
        await this.getNodeRRdata()
        if (this.contentType == 2) {
          this.timeoutList.push(setTimeout(() => { tf1() }, 10000))
        }
      }
      tf()
      tf1()
    }
  },
  created() {
    this.username = localStorage.getItem(STROGE.USERNAME) || ''
  },
  mounted() {
    this.dataCenterRequest()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/_main.scss';

#home {
  background: $bg-color;
  height: 100vh;
  width: 100vw;
  min-width: 1000px;
}

$header-height: 60px;
.header {
  height: $header-height;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;

  &_left {
    color: #333;
    font-weight: bold;
  }

  &_right {
    display: flex;
    align-items: center;

    &_username {
      margin-right: 20px;
      color: #666;
    }
  }
}

.main {
  display: flex;
  height: calc(100vh - #{$header-height});
  padding: 0 20px 20px;

  &_item { 
    height: 100%;
    background: #fff;
    border-radius: 4px;
  }
}

.nav {
  min-width: 200px;
  padding: 10px 0;
  margin-right: 10px;
}

.content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}
</style>