<template>
  <div>
    <el-row :gutter="15">
      <el-col :md="24" :lg="12" class="col">
        <data-card title="健康" class="card">
          <div class="health">
            <div class="health_item">
              <div class="health_item_title">状态</div>
              <i class="el-icon-success" style="color: #21BF4B; font-size: 55px;"></i>
            </div>
            <div class="health_item">
              <div class="health_item_title">节点</div>
              <div class="health_item_nodestatus">
                <div>
                  <i class="el-icon-check" style="color: #21BF4B; font-weight: bold; margin-right: 10px;"></i>在线
                </div>
                <div>{{ status.health.nodes.online }}</div>
              </div>
              <div class="health_item_nodestatus">
                <div>
                  <i class="el-icon-close" style="color: #FF6C59; font-weight: bold; margin-right: 10px;"></i>离线
                </div>
                <div>{{ status.health.nodes.offline }}</div>
              </div>
            </div>
          </div>
        </data-card>
      </el-col>
      <el-col :md="24" :lg="12" class="col">
        <data-card title="访客" class="card">
          <div class="visitor">
            <div class="visitor_item">
              <div class="visitor_item_title">虚拟机</div>
              <div class="visitor_item_status">
                <div>
                  <i class="el-icon-video-play" style="color: #21BF4B; font-weight: bold; margin-right: 10px;"></i>运行中
                </div>
                <div>{{ status.visitor.qemu.running }}</div>
              </div>
              <div class="visitor_item_status">
                <div>
                  <i class="el-icon-video-pause" style="color: #CFCFCF; font-weight: bold; margin-right: 10px;"></i>已停止
                </div>
                <div>{{ status.visitor.qemu.stopped }}</div>
              </div>
            </div>
            <div class="visitor_item">
              <div class="visitor_item_title">LXC容器</div>
              <div class="visitor_item_status">
                <div>
                  <i class="el-icon-video-play" style="color: #21BF4B; font-weight: bold; margin-right: 10px;"></i>运行中
                </div>
                <div>{{ status.visitor.lxc.running }}</div>
              </div>
              <div class="visitor_item_status">
                <div>
                  <i class="el-icon-video-pause" style="color: #CFCFCF; font-weight: bold; margin-right: 10px;"></i>已停止
                </div>
                <div>{{ status.visitor.lxc.stopped }}</div>
              </div>
            </div>
          </div>
        </data-card>
      </el-col>
      <el-col :md="24" :lg="12" class="col">
        <data-card title="资源" class="card">
          <div class="resource">
            <div class="resource_item">
              <div class="resource_item_title">CPU</div>
              <v-chart :options="cpuChartOption" class="resource-chart"/>
              <div>of {{ status.resource.maxcpu }} CPU(s)</div>
              <div class="resource_item_centertext">{{ status.resource.cpuUsage }}%</div>
            </div>
            <div class="resource_item">
              <div class="resource_item_title">内存</div>
              <v-chart :options="memChartOption" class="resource-chart"/>
              <div>{{ (status.resource.mem / 1024 / 1024 / 1024).toFixed(2) }} GiB of {{ (status.resource.maxmem / 1024 / 1024 / 1024).toFixed(2) }} GiB</div>
              <div class="resource_item_centertext">{{ status.resource.memUsage }}%</div>
            </div>
            <div class="resource_item">
              <div class="resource_item_title">存储</div>
              <v-chart :options="cpuChartOption" class="resource-chart"/>
              <div>{{ (status.resource.disk / 1024 / 1024 / 1024).toFixed(2) }} GiB of {{ (status.resource.maxdisk / 1024 / 1024 / 1024).toFixed(2) }} GiB</div>
              <div class="resource_item_centertext">{{ status.resource.diskUsage }}%</div>
            </div>
          </div>
        </data-card>
      </el-col>
      <el-col :md="24" :lg="12" class="col">
        <data-card title="节点" class="card">
          <el-table :data="status.nodes">
            <el-table-column
              prop="name"
              label="名称">
            </el-table-column>
            <el-table-column
              prop="nodeid"
              label="ID">
            </el-table-column>
            <el-table-column
              prop="status"
              label="状态">
            </el-table-column>
            <el-table-column
              prop="ip"
              label="服务器地址">
            </el-table-column>
            <el-table-column
              prop="cpuUsage"
              label="CPU使用率%">
            </el-table-column>
            <el-table-column
              prop="memUsage"
              label="内存使用率%">
            </el-table-column>
            <el-table-column
              prop="diskUsage"
              label="硬盘使用率%">
            </el-table-column>
          </el-table>
        </data-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { DataCard } from '@/components'
import { halfRingChartSeries } from './charts'

const colorSmall = ['#C2DDF2', '#F5F5F5']
const colorBig = ['#FFCC00', '#F5F5F5']

export default {
  name: 'DataCenter',
  components: {
    'data-card': DataCard
  },
  props: {
    status: {
      type: Object,
      default() {
        return {
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
        }
      }
    }
  },
  computed: {
    cpuChartOption() {
      return {
        series: [
          {
            ...halfRingChartSeries,
            color: Number(this.status.resource.cpuUsage) > 50 ? colorBig : colorSmall,
            data: [
              { value: Number(this.status.resource.cpuUsage), name: 'cpu' },
              { value: 100, name: 'empty' }
            ]
          }
        ]
      }
    },
    diskChartOption() {
      return {
        series: [
          {
            ...halfRingChartSeries,
            color: Number(this.status.resource.diskUsage) > 50 ? colorBig : colorSmall,
            data: [
              { value: this.status.resource.disk, name: 'disk' },
              { value: this.status.resource.maxdisk - this.status.resource.disk, name: 'empty' }
            ]
          }
        ]
      }
    },
    memChartOption() {
      return {
        series: [
          {
            ...halfRingChartSeries,
            color: Number(this.status.resource.memUsage) > 50 ? colorBig : colorSmall,
            data: [
              { value: this.status.resource.mem, name: 'mem' },
              { value: this.status.resource.maxmem - this.status.resource.mem, name: 'empty' }
            ]
          }
        ]
      }
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>

.col {
  margin-bottom: 15px;
}

.card {
  height: 270px;
  overflow: hidden;
}


.health {
  display: flex;
  padding: 20px;

  &_item {
    flex: 1;
    color: #666;
    display: flex;
    flex-direction: column;
    align-items: center;

    &_title {
      margin-bottom: 20px;
      color: #333;
      font-size: 18px;
      font-weight: bold;
    }

    &_nodestatus {
      display: flex;
      width: 140px;
      justify-content: space-between;
    }
  }
}

.visitor {
  display: flex;
  padding: 20px;

  &_item {
    flex: 1;
    color: #666;
    display: flex;
    flex-direction: column;
    align-items: center;

    &_title {
      margin-bottom: 20px;
      color: #333;
      font-size: 18px;
      font-weight: bold;
    }

    &_status {
      display: flex;
      width: 190px;
      justify-content: space-between;
    }
  }
}

.resource-chart {
  width: 150px;
  height: 150px;
}

.resource {
  display: flex;
  padding: 10px;

  &_item {
    flex: 1;
    color: #666;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;

    &_title {
      color: #333;
      font-weight: bold;
    }

    &_centertext {
      position: absolute;
      top: 85px;
    }
  }
}
</style>