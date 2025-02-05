Page({
  data: {
    income: 0,
    date: '',
    incomeList: [],
    newAmount: '',
    newDescription: ''
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

  // 输入描述
  bindDescriptionInput(e) {
    this.setData({
      newDescription: e.detail.value
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
      description: this.data.newDescription || '收入'
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
  }
}) 