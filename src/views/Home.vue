<template>
  <div id="home">
    <div class="header">
      <div class="header_left">后台管理</div>
      <div class="header_right">
        <div class="header_right_username">欢迎! {{ username }}</div>
        <el-button type="primary" @click="logout">注销</el-button>
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
          <el-menu-item index="2" @click.native="onApplicationCenterClick">
            <template slot="title">
              <i class="el-icon-menu"></i>
              <span>应用中心</span>
            </template>
          </el-menu-item>
        </el-menu>
      </div>
      <div class="main_item content">
        <data-center v-if="contentType == 0" :status="status" :tasks="tasks" :logs="logs"></data-center>
        <node-center v-if="contentType == 1" :status="nodeCenterStatus"></node-center>
        <node v-if="contentType == 2" :status="nodeStaus" :selectNode="selectNode" :selectNodeCenter="selectNodeCenter"></node>
        <app-center v-if="contentType == 3"/>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios'
import { STROGE, API } from '@/constants'
import { DataCenter, NodeCenter, Node, AppCenter } from './homeViews' 

export default {
  name: 'Home',
  components: {
    'data-center': DataCenter,
    'node-center': NodeCenter,
    'node': Node,
    'app-center': AppCenter
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
      timeoutList: [],
      nodeCenters: [],
      ports: {},
      tasks: [],
      logs: []
    }
  },
  methods: {
    logout() {
      this.clearAllTimeout()
      this.$router.push({ name: 'login' })
    },
    onDataCenterClick() {
      this.clearAllTimeout()
      this.dataCenterRequest()
    },
    onNodeCenterClick(index, e) {
      const nodeCenter = this.status.nodes[index].node
      if (!nodeCenter) {
        this.$message.info('加载中...请稍后再试')
        return
      }
      this.selectNodeCenter = nodeCenter
      this.clearAllTimeout()
      this.nodeCenterRequest()
      e.stopPropagation()
    },
    onNodeClick(centerIndex, nodeIndex, e) {
      const nodeCenter = this.status.nodes[centerIndex].node
      const node = this.status.nodes[centerIndex].nodes[nodeIndex].id
      if (!nodeCenter || !node) {
        this.$message.info('加载中...请稍后再试')
        return
      }
      this.selectNodeCenter = nodeCenter
      this.selectNode = node
      this.clearAllTimeout()
      this.nodeRequest()
      e.stopPropagation()
    },
    onApplicationCenterClick() {
      this.contentType = 3
      this.clearAllTimeout()
    },
    clearAllTimeout() {
      return new Promise((resolve) => {
        for (let item of this.timeoutList) {
          clearInterval(item)
        }
        this.timeoutList = []
        resolve()
      })
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

        this.saveNodesForPorts()
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
      this.nodeStaus.status.port = this.ports[this.selectNode] || 5000
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
      this.getStatusData()
      this.getResourcesData()
      this.getTasksData()
      this.getLogsData()
      this.timeoutList.push(setInterval(async () => {
        await this.getStatusData()
        await this.getResourcesData()
      }, 5000))
      this.timeoutList.push(setInterval(async () => {
        await this.getTasksData()
        await this.getLogsData()
      }, 60000))
    },
    nodeCenterRequest() {
      this.contentType = 1
      this.getNodeCenterStatusData()
      this.getNodeCenterRRdata()
      this.timeoutList.push(setInterval(async () => {
        await this.getNodeCenterStatusData()
      }, 5000))
      this.timeoutList.push(setInterval(async () => {
        await this.getNodeCenterRRdata()
      }, 5000))
    },
    nodeRequest() {
      this.contentType = 2
      this.getNodeStatusData()
      this.getNodeRRdata()
      this.timeoutList.push(setInterval(async () => {
        await this.getNodeStatusData()
      }, 5000))
      this.timeoutList.push(setInterval(async () => {
        await this.getNodeRRdata()
      }, 5000))
    },
    saveNodesForPorts() {
      const nodeCenters = []
      for (let item of this.status.nodes) {
        const nodes = []
        for (let item1 of item.nodes) {
          nodes.push({
            id: item1.id,
            name: item1.name,
          })
        }

        nodeCenters.push({
          node: item.node,
          nodes
        })
      }

      if (this.nodeCenters.length == nodeCenters.length) {
        return
      }
      this.nodeCenters = nodeCenters
      localStorage.setItem('nodeCenters', JSON.stringify(nodeCenters))
    },
    async getTasksData() {
      const res = await axios.get(API.CLUSTER_TASKS)
      if (!res) {
        return
      }
      const data = res.data.data
      for (let item of data) {
        item.starttime = this.formatTime(item.starttime)
        item.endtime = this.formatTime(item.endtime)
      }
      this.tasks = data
    },
    async getLogsData() {
      const res = await axios.get(API.CLUSTER_LOG)
      if (!res) {
        return
      }
      const data = res.data.data
      for (let item of data) {
        item.time = this.formatTime(item.time)
      }
      this.logs = data
    },
    formatTime(t) {
      const time = new Date(t * 1000)
      return `${time.getFullYear()}-${time.getMonth()+1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
    }
  },
  created() {
    this.username = localStorage.getItem(STROGE.USERNAME) || ''
  },
  async mounted() {
    const res = await axios.post(API.LOGIN, { username: this.username, password: localStorage.getItem('password') })
    if (!res) {
      return
    }

    let ports = localStorage.getItem('ports')
    if (ports) {
      this.ports = JSON.parse(ports)
    }
    this.dataCenterRequest()
  },
  beforeDestroy() {
    this.clearAllTimeout()
  },
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