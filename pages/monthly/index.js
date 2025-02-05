Page({
  data: {
    income: 0,
    currentMonth: '',
    incomeList: [],
    incomeDays: 0,
    averageIncome: '0.00',
    startDate: '',
    endDate: ''
  },

  onLoad() {
    this.setCurrentMonth()
  },

  onShow() {
    this.loadMonthlyIncome()
  },

  // 设置当前月份
  setCurrentMonth() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const firstDay = '01'
    const lastDay = new Date(year, Number(month), 0).getDate()
    const startDate = `${year}-${month}-${firstDay}`
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`
    
    this.setData({ 
      currentMonth: `${year}-${month}`,
      startDate,
      endDate
    })
  },

  // 开始日期选择器改变
  bindStartDateChange(e) {
    const startDate = e.detail.value
    const [year, month] = startDate.split('-')
    
    this.setData({
      currentMonth: `${year}-${month}`,
      startDate
    })
    this.loadMonthlyIncome()
  },

  // 结束日期选择器改变
  bindEndDateChange(e) {
    const endDate = e.detail.value
    const [year, month] = endDate.split('-')
    
    this.setData({
      currentMonth: `${year}-${month}`,
      endDate
    })
    this.loadMonthlyIncome()
  },

  // 加载月度收入数据
  loadMonthlyIncome() {
    const [startYear, startMonth, startDay] = this.data.startDate.split('-')
    const [endYear, endMonth, endDay] = this.data.endDate.split('-')
    
    const startDate = new Date(startYear, Number(startMonth) - 1, Number(startDay))
    const endDate = new Date(endYear, Number(endMonth) - 1, Number(endDay))
    
    const incomeList = []
    let totalIncome = 0
    let incomeDays = 0

    // 遍历日期范围内的每一天
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      
      const dailyIncomeKey = `daily_income_${dateStr}`
      const dailyIncomeData = wx.getStorageSync(dailyIncomeKey) || []
      
      // 计算日收入总额
      const dailyTotal = dailyIncomeData.reduce((sum, item) => sum + Number(item.amount), 0)
      
      if (dailyTotal > 0) {
        incomeList.push({
          date: dateStr,
          formattedDate: this.formatDate(dateStr),
          amount: dailyTotal,
          details: dailyIncomeData
        })
        
        totalIncome += dailyTotal
        incomeDays++
      }
    }

    // 计算日均收入
    const averageIncome = incomeDays > 0 
      ? (totalIncome / incomeDays).toFixed(2)
      : '0.00'

    this.setData({
      incomeList: incomeList.sort((a, b) => b.date.localeCompare(a.date)),
      income: totalIncome,
      incomeDays,
      averageIncome
    })
  },

  // 格式化日期显示
  formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-')
    return `${month}月${day}日`
  },

  // 查看日收入详情
  viewDailyDetails(e) {
    const { date } = e.currentTarget.dataset
    const details = this.data.incomeList.find(item => item.date === date).details
    
    wx.showModal({
      title: this.formatDate(date) + '收入明细',
      content: details.map(item => 
        `${item.time} - ¥${item.amount}${item.description ? (' (' + item.description + ')') : ''}`
      ).join('\n'),
      showCancel: false,
      confirmText: '关闭'
    })
  }
}) 