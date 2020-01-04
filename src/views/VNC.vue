<template>
  <div>
    <div id="view" ref="view"></div>
  </div>
</template>

<script>
import axios from '@/utils/axios'
import RFB from '@novnc/novnc/core/rfb'

export default {
  name: 'VNC',
  data() {
    return {
      selectNodeCenter: '',
      selectNode: '',
      vncData: {},
      rfb: null
    }
  },
  methods: {
    async getVNCData() {
      const res = await axios.post(`/api2/json/nodes/${this.selectNodeCenter}/${this.selectNode}/vncproxy`, { websocket: 1 })
      if (!res) {
        return
      }
      this.vncData = res.data.data
      const { ticket, port } = this.vncData
      this.rfb = new RFB(this.$refs.view, 
        `wss://nas.snas.xyz:8006/api2/json/nodes/${this.selectNodeCenter}/${this.selectNode}/vncwebsocket?port=${port}&vncticket=${encodeURIComponent(ticket)}`,
        { credentials: { password: ticket } }
      );
    },
    disconect() {
      this.rfb.disconect()
    }
  },
  async mounted() {
    const { selectNodeCenter, selectNode } = this.$route.query
    this.selectNodeCenter = selectNodeCenter
    this.selectNode = selectNode

    await this.getVNCData()
  },
  beforeDestroy() {
    this.disconect()
  }
}
</script>

<style lang="scss" scoped>

#view {
  width: 100vw;
  height: 100vh;
}

</style>