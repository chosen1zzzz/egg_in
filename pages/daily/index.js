Page({
  data: {
    income: 0,
    date: '',
    incomeList: [],
    newAmount: '',
    newDescription: '',
    showForm: false,
    buttonLeft: wx.getSystemInfoSync().windowWidth - 140,
    buttonTop: wx.getSystemInfoSync().windowHeight - 300,
    startX: 0,
    startY: 0,
    descriptionOptions: [
      '王小明',
      '张三',
      '李四四',
      '赵武',
      '孙悟空',
      '周杰伦',
      '吴彦祖',
      '郑大大',
      '钱多多',
      '陈奕迅',
      '徐老师',
      '马冬梅',
      '胡一刀',
      '林志玲',
      '刘德华',
      '黄老邪',
      '杨过',
      '朱八八',
      '何仙姑',
      '高富帅'
    ],
    selectedDescriptionIndex: -1,
    showDescriptionSelect: false
  },

  onLoad() {
    this.setToday()
    this.loadDailyIncome()
  },

  onShow() {
    this.loadDailyIncome()
  },

  // 设置为今天日期
  setToday() {
    const now = new Date()
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    this.setData({ date })
  },

  // 加载指定日期的收入数据
  loadDailyIncome() {
    const date = this.data.date
    const storageKey = `daily_income_${date}`
    const incomeData = wx.getStorageSync(storageKey) || []
    
    this.setData({
      incomeList: incomeData.sort((a, b) => {
        // 按时间倒序排列
        return b.time.localeCompare(a.time)
      })
    })
    this.calculateTotalIncome()
  },

  // 计算总收入
  calculateTotalIncome() {
    const total = this.data.incomeList.reduce((sum, item) => sum + Number(item.amount), 0)
    
    this.setData({
      income: total
    })
  },

  // 日期选择器改变
  bindDateChange(e) {
    this.setData({
      date: e.detail.value
    })
    this.loadDailyIncome()
  },

  // 输入金额
  bindAmountInput(e) {
    this.setData({
      newAmount: e.detail.value
    })
  },

  // 选择描述
  bindDescriptionChange(e) {
    this.setData({
      selectedDescriptionIndex: Number(e.detail.value),
      newDescription: this.data.descriptionOptions[Number(e.detail.value)]
    })
  },

  // 添加收入记录
  addIncome() {
    if (!this.data.newAmount) {
      wx.showToast({
        title: '请输入金额',
        icon: 'none'
      })
      return
    }

    if (this.data.selectedDescriptionIndex === -1) {
      wx.showToast({
        title: '请选择描述',
        icon: 'none'
      })
      return
    }

    const amount = Number(this.data.newAmount)
    if (isNaN(amount) || amount <= 0) {
      wx.showToast({
        title: '请输入有效金额',
        icon: 'none'
      })
      return
    }

    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    
    const newIncome = {
      time,
      amount,
      description: this.data.newDescription
    }

    const storageKey = `daily_income_${this.data.date}`
    const currentList = wx.getStorageSync(storageKey) || []
    const incomeList = [newIncome, ...currentList]
    
    // 保存到本地存储
    wx.setStorageSync(storageKey, incomeList)
    
    this.setData({
      incomeList,
      newAmount: '',
      newDescription: ''
    })
    
    this.calculateTotalIncome()

    wx.showToast({
      title: '添加成功',
      icon: 'success'
    })
  },

  // 删除收入记录
  deleteIncome(e) {
    const index = e.currentTarget.dataset.index
    wx.showModal({
      title: '提示',
      content: '确定要删除这条收入记录吗？',
      success: res => {
        if (res.confirm) {
          const incomeList = [...this.data.incomeList]
          incomeList.splice(index, 1)
          
          const storageKey = `daily_income_${this.data.date}`
          wx.setStorageSync(storageKey, incomeList)
          
          this.setData({ incomeList })
          this.calculateTotalIncome()
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  showAddIncomeForm() {
    this.setData({
      showForm: !this.data.showForm,
      newAmount: '',
      newDescription: '',
      selectedDescriptionIndex: -1
    })
  },

  hideAddIncomeForm() {
    this.setData({
      showForm: false,
      newAmount: '',
      newDescription: '',
      selectedDescriptionIndex: -1,
      showDescriptionSelect: false
    })
  },

  buttonTouchStart(e) {
    this.setData({
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY
    })
  },

  buttonTouchMove(e) {
    const moveX = e.touches[0].clientX - this.data.startX
    const moveY = e.touches[0].clientY - this.data.startY
    
    this.setData({
      buttonLeft: this.data.buttonLeft + moveX,
      buttonTop: this.data.buttonTop + moveY,
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY
    })
  },

  buttonTouchEnd() {
    // 确保按钮不会超出屏幕边界
    const systemInfo = wx.getSystemInfoSync()
    let { buttonLeft, buttonTop } = this.data
    
    if (buttonLeft < 0) buttonLeft = 0
    if (buttonTop < 0) buttonTop = 0
    if (buttonLeft > systemInfo.windowWidth - 100) buttonLeft = systemInfo.windowWidth - 100
    if (buttonTop > systemInfo.windowHeight - 100) buttonTop = systemInfo.windowHeight - 100
    
    this.setData({ buttonLeft, buttonTop })
  },

  stopPropagation() {
    // 阻止事件冒泡
  },

  toggleDescriptionSelect() {
    this.setData({
      showDescriptionSelect: !this.data.showDescriptionSelect
    })
  },

  selectDescription(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      selectedDescriptionIndex: index,
      newDescription: this.data.descriptionOptions[index],
      showDescriptionSelect: false
    })
  }
}) 