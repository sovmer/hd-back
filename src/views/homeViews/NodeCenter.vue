<template>
  <div class="node-center">
    <el-row :gutter="15">
      <el-col :md="24" :lg="12" class="col">
        <data-card :title="`状态(运行时间: ${Math.floor(status.status.uptime / 3600 / 24)} 天 ${Math.floor((status.status.uptime - Math.floor(status.status.uptime / 3600 / 24) * 3600 * 24) / 3600)} 时)`" class="card">
          <div class="status">
            <div class="status_item0">
              <div class="status_item0_top">
                <div>CPU利用率</div>
                <div>{{ (status.status.cpu * 100).toFixed(2) }}%</div>
              </div>
              <el-progress :percentage="status.status.cpu * 100" :color="progressColor" :show-text="false" class="status_item0_progress"></el-progress>
            </div>
            <div class="status_item0">
              <div class="status_item0_top">
                <div>内存使用率</div>
                <div>{{ (status.status.memory.used / status.status.memory.total * 100).toFixed(2) }}%</div>
              </div>
              <el-progress :percentage="status.status.memory.used / status.status.memory.total * 100" :color="progressColor" :show-text="false" class="status_item0_progress"></el-progress>
            </div>
            <div class="status_item0">
              <div class="status_item0_top">
                <div>硬盘使用率</div>
                <div>{{ (status.status.rootfs.used / status.status.rootfs.total * 100).toFixed(2) }}%</div>
              </div>
              <el-progress :percentage="status.status.rootfs.used / status.status.rootfs.total * 100" :color="progressColor" :show-text="false" class="status_item0_progress"></el-progress>
            </div>
            <div class="status_item0">
              <div class="status_item0_top">
                <div>IO延迟</div>
                <div>{{ (status.status.wait * 100).toFixed(2) }}%</div>
              </div>
              <el-progress :percentage="status.status.wait * 100" :color="progressColor" :show-text="false" class="status_item0_progress"></el-progress>
            </div>
            <div class="status_item0">
              <div class="status_item0_top">
                <div>SWAP使用率</div>
                <div>{{ (status.status.swap.used / status.status.swap.total * 100).toFixed(2) }}%</div>
              </div>
              <el-progress :percentage="status.status.swap.used / status.status.swap.total * 100" :color="progressColor" :show-text="false" class="status_item0_progress"></el-progress>
            </div>
            <div class="status_item1">
              <div>CPU(s)</div>
              <div>{{ status.status.cpuinfo.cpus }} x {{ status.status.cpuinfo.model }}</div>
            </div>
            <div class="status_item1">
              <div>内核版本</div>
              <div>{{ status.status.kversion }}</div>
            </div>
            <div class="status_item1">
              <div>PVE管理器版本</div>
              <div>{{ status.status.pveversion }}</div>
            </div>
            <div class="status_item1">
              <div>KSM共享</div>
              <div>{{ (status.status.ksm.shared / 1024 / 1024).toFixed(2) }} MiB</div>
            </div>
          </div>
        </data-card>
      </el-col>
      <el-col :md="24" :lg="12" class="col">
        <areachart-card title="CPU利用率" 
          :legend="['IO延迟', 'CPU使用率']" 
          :xAxis="chartData.xAxis" 
          :series="[
            { name: 'IO延迟', data: chartData.ioS },
            { name: 'CPU使用率', data: chartData.cpuS }
          ]" 
          class="card">
        </areachart-card>
      </el-col>
      <el-col :md="24" :lg="12" class="col">
        <areachart-card title="服务器负载" 
          :legend="['平均负荷']" 
          :xAxis="chartData.xAxis" 
          :series="[
            { name: '平均负荷', data: chartData.loadS },
          ]" 
          class="card">
        </areachart-card>
      </el-col>
      <el-col :md="24" :lg="12" class="col">
        <areachart-card title="内存使用率" 
          :legend="['总额', '内存使用']" 
          :xAxis="chartData.xAxis" 
          :series="[
            { name: '总额', data: chartData.memTotalS },
            { name: '内存使用', data: chartData.memS }
          ]" 
          class="card">
        </areachart-card>
      </el-col>
      <el-col :md="24" :lg="12" class="col">
        <areachart-card title="网络流量" 
          :legend="['netin', 'netout']" 
          :xAxis="chartData.xAxis" 
          :series="[
            { name: 'netin', data: chartData.netinS },
            { name: 'netout', data: chartData.netoutS }
          ]" 
          class="card">
        </areachart-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { DataCard, AreaChartCard } from '@/components'

export default {
  name: 'NodeCenter',
  components: {
    'data-card': DataCard,
    'areachart-card': AreaChartCard
  },
  props: {
    status: {
      type: Object,
      default() {
        return {
          status: {},
          rrdata: []
        }
      }
    }
  },
  computed: {
    chartData() {
      const xAxis = []
      const cpuS = []
      const ioS = []
      const loadS = []
      const memS = []
      const memTotalS = []
      const netinS = []
      const netoutS = []

      for (let item of this.status.rrdata) {
        const time = new Date(item.time * 1000)
        xAxis.push(`${time.getFullYear()}-${time.getMonth()}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`)
        cpuS.push(+(item.cpu * 100).toFixed(1))
        ioS.push(+(item.iowait * 100).toFixed(1))
        loadS.push(+(item.loadavg).toFixed(2))
        memS.push(+(item.memused / 1024 / 1024 / 1024).toFixed(1))
        memTotalS.push(+(item.memtotal / 1024 / 1024 / 1024).toFixed(1))
        netinS.push(+(item.netin).toFixed(1))
        netoutS.push(+(item.netout).toFixed(1))
      }
      return {
        xAxis, cpuS, ioS, loadS, memS, memTotalS, netinS, netoutS
      }
    }
  },
  data() {
    return {
      progressColor: [
        {color: '#C2DDF2', percentage: 50},
        {color: '#FFCC00', percentage: 100},
      ]
    }
  }
}
</script>

<style lang="scss" scoped>

.col {
  margin-bottom: 15px;
}

.card {
  height: 300px;
  overflow: hidden;
  position: relative;
}

.status {
  position: relative;
  padding: 10px;
  color: #666;
  font-size: 14px;
  display: flex;
  flex-wrap: wrap;

  &_item0 {
    width: 50%;

    &_top {
      width: 90%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    &_progress {
      width: 90%;
      margin-bottom: 10px;
    }
  }

  &_item1 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 95%;
    margin-bottom: 10px;
  }
}
</style>