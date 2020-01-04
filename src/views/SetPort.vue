<template>
  <div class="setports">
    <div v-for="(center, index) in nodeCenters" :key="index" class="nodecenter">
      <div class="nodecenter_title">{{ center.node }}</div>
      <div v-for="(node , nodeIndex) in center.nodes" :key="nodeIndex" class="node">
        <div class="node_t">{{ node.id }}</div>
        <div class="node_t">{{ node.name }}</div>
        <input type="number" placeholder="填写端口" :value="ports[node.id] || 5000" @input="portChange($event, node.id)"/>
      </div>
    </div>
    <button @click="save">保存</button>
  </div>
</template>

<script>
export default {
  name: 'SetPort',
  data() {
    return {
      nodeCenters: [],
      ports: {}
    }
  },
  methods: {
    portChange(e, id) {
      this.ports[id] = +e.target.value
    },
    save() {
      localStorage.setItem('ports', JSON.stringify(this.ports))
      this.$message('保存成功')
    }
  },
  mounted() {
    if (localStorage.getItem('nodeCenters')) {
      this.nodeCenters = JSON.parse(localStorage.getItem('nodeCenters'))
    }
    if (localStorage.getItem('ports')) {
      this.ports = JSON.parse(localStorage.getItem('ports'))
    }
  }
}
</script>

<style lang="scss" scoped>

.setports {
  color: #666;
  padding: 20px;
}

.nodecenter {
  margin-bottom: 20px;

  &_title {
    color: #333;
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 10px;
  }
}

.node {
  display: flex;
  align-items: center;

  &_t {
    margin-right: 20px;
  }
}
</style>