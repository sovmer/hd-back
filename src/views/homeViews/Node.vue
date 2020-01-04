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
                <div>{{ (status.status.mem / status.status.maxmem * 100).toFixed(2) }}%</div>
              </div>
              <el-progress :percentage="status.status.mem / status.status.maxmem * 100" :color="progressColor" :show-text="false" class="status_item0_progress"></el-progress>
            </div>
            <div class="status_item1">
              <div>状态</div>
              <div>{{ status.status.status }}</div>
            </div>
            <div class="status_item1">
              <div>引导磁盘大小</div>
              <div>{{ (status.status.maxdisk / 1024 / 1024 / 1024).toFixed(2) }} GiB</div>
            </div>
            <a :href="`http://nas.snas.xyz:${status.status.port || 5000}`" target="_blank" class="tonode">应用</a>
            <router-link :to="{ name: 'vnc', query: { selectNode, selectNodeCenter } }" class="tonode">VNC</router-link>
          </div>
        </data-card>
      </el-col>
      <el-col :md="24" :lg="12" class="col">
        <areachart-card title="CPU利用率" 
          :legend="['CPU使用率']" 
          :xAxis="chartData.xAxis" 
          :series="[
            { name: 'CPU使用率', data: chartData.cpuS }
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
          :legend="['netout', 'netin']" 
          :xAxis="chartData.xAxis" 
          :series="[
            { name: 'netout', data: chartData.netoutS },
            { name: 'netin', data: chartData.netinS }
          ]" 
          class="card">
        </areachart-card>
      </el-col>
      <el-col :md="24" :lg="12" class="col">
        <areachart-card title="磁盘IO" 
          :legend="['diskread', 'diskwrite']" 
          :xAxis="chartData.xAxis" 
          :series="[
            { name: 'diskread', data: chartData.diskreadS },
            { name: 'diskwrite', data: chartData.diskwriteS }
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
  name: 'Node',
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
    },
    selectNode: {
      type: String
    },
    selectNodeCenter: {
      type: String
    }
  },
  computed: {
    chartData() {
      const xAxis = []
      const cpuS = []
      const memS = []
      const memTotalS = []
      const netinS = []
      const netoutS = []
      const diskreadS = []
      const diskwriteS = []

      for (let item of this.status.rrdata) {
        const time = new Date(item.time * 1000)
        xAxis.push(`${time.getFullYear()}-${time.getMonth()+1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`)
        cpuS.push(+(item.cpu * 100).toFixed(1))
        memS.push(+(item.mem / 1024 / 1024 / 1024).toFixed(1))
        memTotalS.push(+(item.maxmem / 1024 / 1024 / 1024).toFixed(1))
        if (item.netin) {
          netinS.push(+(item.netin).toFixed(1))
          netoutS.push(+(item.netout).toFixed(1))
        }
        if (item.diskread) {
          diskreadS.push(+(item.diskread).toFixed(1))
          diskwriteS.push(+(item.diskwrite).toFixed(1))
        }
      }
      return {
        xAxis, cpuS, memS, memTotalS, netinS, netoutS, diskreadS, diskwriteS
      }
    }
  },
  data() {
    return {
      progressColor: [
        {color: '#C2DDF2', percentage: 50},
        {color: '#FFCC00', percentage: 100},
      ],
    }
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/_main.scss';

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

.tonode {
  padding: 6px 20px;
  background: $primary-color;
  color: #ffffff;
  text-decoration: none;
  border-radius: 4px;
  margin-top: 20px;
  margin-right: 20px;
}
</style>