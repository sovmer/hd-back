<template>
  <div>
    <data-card :title="title" class="card">
      <v-chart :options="option" autoresize class="chart"/>
    </data-card>
  </div>
</template>

<script>
import DataCard from "./DataCard";

export default {
  name: "AreaChartCard",
  components: {
    "data-card": DataCard
  },
  props: {
    title: {
      type: String,
      default: ""
    },
    legend: {
      type: Array,
      default() {
        return [];
      }
    },
    xAxis: {
      type: Array,
      default() {
        return [];
      }
    },
    series: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  computed: {
    option() {
      const series = this.series.map(item => {
        return {
          name: item.name,
          type: "line",
          stack: "总量",
          areaStyle: {},
          symbol: 'none',
          data: item.data
        }
      })

      return {
        color: ["#94AE0A", "#115FA6"],
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985"
            }
          }
        },
        legend: {
          data: this.legend
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: [
          {
            type: "category",
            boundaryGap: false,
            data: this.xAxis
          }
        ],
        yAxis: [
          {
            type: "value"
          }
        ],
        series
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.card {
  height: 300px;
}

.chart {
  width: 100%;
  height: 260px;
}
</style>