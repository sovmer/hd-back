<template>
  <div id="appcenter">
    <div class="apps">
      <div v-for="(item, index) in apps" :key="index" class="apps_item" @click="onAppClick(item)" @mouseenter="onItemMouseOver(index, true)" @mouseleave="onItemMouseOver(index, false)">
        <img :src="`app${item.icon}.svg`" class="apps_item_icon" />
        <div class="apps_item_name">{{ item.name }}</div>
        <div v-if="appStatus[index].hover" class="apps_item_edit" @click.stop="onAppEditClick(item, index)"><i class="el-icon-s-tools apps_item_edit_icon"/></div>
        <div v-if="appStatus[index].hover" class="apps_item_close" @click.stop="onAppDeleteIconClick(index)">
          <i class="el-icon-close apps_item_close_icon"/>
        </div>
      </div>
      <div class="apps_add" @click="onAddClick">
        <img src="../../assets/img/add.svg" class="apps_add_img"/>
      </div>
    </div>
    <el-dialog
      title="APP"
      :visible.sync="dialogVisible"
      width="30%">
      <el-input v-model="dialogItemInfo.name" placeholder="名称" class="dialog_input"></el-input>
      <el-input v-model="dialogItemInfo.link" placeholder="链接" class="dialog_input"></el-input>
      <el-select v-model="dialogItemInfo.icon" placeholder="图标" class="dialog_input">
        <el-option
          v-for="item in icons"
          :key="item"
          :label="item"
          :value="item"
          class="option">
          <span class="option-label">{{ item }}</span>
          <img :src="`app${item}.svg`" class="option-img"/>
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="onAppChangeClick">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="deleteDialogStatus.show"
      width="30%">
      <div>确认删除?</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogStatus.show = false">取 消</el-button>
        <el-button type="primary" @click="onItemDeleteClick">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const APP_ICON_MAX = 13
const DIALOG_ADD = 0
const DIALOG_EDIT = 1

export default {
  name: 'AppCenter',
  data() {
    return {
      apps: [],
      appStatus: [],
      icons: [],
      dialogVisible: false,
      dialogItemInfo: {
        name: '',
        link: '',
        icon: 0
      },
      dialogType: -1,
      itemIndex: -1,
      deleteDialogStatus: {
        show: false,
        index: -1
      }
    }
  },
  methods: {
    onAppClick(item) {
      window.location = item.link
    },
    onAppChangeClick() {
      const { name, link, icon } = this.dialogItemInfo
      if (name == '' || link == '' || !(icon >= 0 && icon <= APP_ICON_MAX)) {
        return
      }

      switch(this.dialogType) {
      case DIALOG_ADD:
        this.apps.push(this.dialogItemInfo)
        this.appStatus.push(this.dialogItemInfo)
        break;
      case DIALOG_EDIT:
        this.$set(this.apps, this.itemIndex, this.dialogItemInfo)
        break; 
      }
      this.saveApps()
      this.dialogVisible = false
    },
    onAddClick() {
      this.dialogItemInfo = {
        name: '',
        link: '',
        icon: 0
      }
      this.dialogType = DIALOG_ADD
      this.dialogVisible = true
    },
    onAppEditClick(item, index) {
      this.dialogItemInfo = item
      this.itemIndex = index
      this.dialogType = DIALOG_EDIT
      this.dialogVisible = true
    },
    onItemMouseOver(index, status) {
      if (this.appStatus[index]) {
        this.appStatus[index].hover = status
      }
    },
    onItemDeleteClick() {
      this.apps.splice(this.deleteDialogStatus.index, 1)
      this.appStatus.splice(this.deleteDialogStatus.index, 1)
      this.saveApps()
      this.deleteDialogStatus.show = false
    },
    onAppDeleteIconClick(index) {
      this.deleteDialogStatus.index = index
      this.deleteDialogStatus.show = true
    },
    saveApps() {
      localStorage.setItem('apps', JSON.stringify(this.apps))
    }
  },
  created() {
    for (let i = 0; i <= APP_ICON_MAX; i++) {
      this.icons.push(i)
    }
    const _apps = localStorage.getItem('apps') || '[{"name":"unas","link":"https://nas.snas.xyz:60050","icon":0},{"name":"群晖","link":"nas.snas.xyz:60051","icon":3},{"name":"nextcould","link":"https://nas.snas.xyz:60052","icon":10},{"name":"aria2内网","link":" http://192.168.1.24:6880","icon":9},{"name":"Transmission","link":"nas.snas.xyz:20001","icon":8,"hover":false},{"name":"Ikuai路由","link":"nas.snas.xyz:60002","icon":5,"hover":false},{"name":"PVE虚拟化","link":"https://nas.snas.xyz:8006","icon":1},{"name":"FTP","link":"ftp://nas.snas.xyz:8021","icon":7}]'
    if (_apps) {
      this.apps = JSON.parse(_apps)
    } else {
      this.apps = []
    }
    this.apps.forEach(() => {
      this.appStatus.push({ hover: false })
    })
  }
}
</script>

<style lang="scss" scoped>

#appcenter {
  padding: 10px;
}

.apps {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  &_item {
    margin-right: 30px;
    margin-bottom: 30px;
    width: 100px;
    height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;

    &:hover {
      border: 2px solid #DCDFE6;
      border-radius: 4px;
    }

    &:active {
      opacity: 0.5;
    }

    &_icon {
      height: 40px;
    }

    &_name {
      color: #666;
    }

    &_edit {
      position: absolute;
      top: 0;
      left: 0;
      padding: 5px;

      &_icon {
        color: #666;
      }
    }

    &_close {
      position: absolute;
      top: 0;
      right: 0;
      padding: 5px;

      &_icon {
        color: #666;
      }
    }
  }

  &_add {
    width: 100px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 30px;
    margin-bottom: 30px;

    &:hover {
      border: 2px solid #DCDFE6;
      border-radius: 4px;
    }

    &:active {
      opacity: 0.5;
    }

    &_img {
      width: 30px;
    }
  }
}

.dialog {
  &_input {
    margin-bottom: 20px;
  }
}

.option {
  display: flex;
  align-items: center;
}

.option-img {
  height: 26px;
}

.option-label {
  margin-right: 20px;
}
</style>