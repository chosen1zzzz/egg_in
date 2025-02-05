// 年收入页面
Page({
  data: {
    income: 0,
    currentYear: '',
    incomeList: [],
    incomeMonths: 0,
    averageIncome: '0.00',
    startDate: '',
    endDate: ''
  },

  onLoad() {
    this.setCurrentYear()
  },

  onShow() {
    this.loadYearlyIncome()
  },

  // 设置当前年份
  setCurrentYear() {
    const now = new Date()
    const year = String(now.getFullYear())
    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`
    
    this.setData({ 
      currentYear: year,
      startDate,
      endDate
    })
  },

  // 开始日期选择器改变
  bindStartDateChange(e) {
    const startDate = e.detail.value
    const [year] = startDate.split('-')
    
    this.setData({
      currentYear: year,
      startDate
    })
    this.loadYearlyIncome()
  },

  // 结束日期选择器改变
  bindEndDateChange(e) {
    const endDate = e.detail.value
    const [year] = endDate.split('-')
    
    this.setData({
      currentYear: year,
      endDate
    })
    this.loadYearlyIncome()
  },

  // 加载年度收入数据
  loadYearlyIncome() {
    const [startYear, startMonth, startDay] = this.data.startDate.split('-')
    const [endYear, endMonth, endDay] = this.data.endDate.split('-')
    
    const startDate = new Date(startYear, Number(startMonth) - 1, Number(startDay))
    const endDate = new Date(endYear, Number(endMonth) - 1, Number(endDay))
    
    const incomeList = []
    let totalIncome = 0
    let incomeMonths = 0

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
        // 检查这个月是否已经添加到列表中
        const monthStr = `${year}-${month}`
        let monthData = incomeList.find(item => item.month === monthStr)
        
        if (!monthData) {
          monthData = {
            month: monthStr,
            formattedMonth: this.formatMonth(monthStr),
            amount: 0,
            days: 0,
            transactions: 0
          }
          incomeList.push(monthData)
          incomeMonths++
        }
        
        monthData.amount += dailyTotal
        monthData.days++
        monthData.transactions += dailyIncomeData.length
        totalIncome += dailyTotal
      }
    }

    // 计算月均收入
    const averageIncome = incomeMonths > 0 
      ? (totalIncome / incomeMonths).toFixed(2)
      : '0.00'

    this.setData({
      incomeList: incomeList.sort((a, b) => b.month.localeCompare(a.month)),
      income: totalIncome.toFixed(2),
      incomeMonths,
      averageIncome
    })
  },

  // 格式化月份显示
  formatMonth(monthStr) {
    const [year, month] = monthStr.split('-')
    return `${month}月`
  },

  // 查看月收入详情
  viewMonthlyDetails(e) {
    const { month } = e.currentTarget.dataset
    const monthData = this.data.incomeList.find(item => item.month === month)
    
    wx.showModal({
      title: monthData.formattedMonth + '收入统计',
      content: [
        `总收入：¥${monthData.amount.toFixed(2)}`,
        `收入天数：${monthData.days}天`,
        `收入笔数：${monthData.transactions}笔`,
        `日均收入：¥${(monthData.amount / monthData.days).toFixed(2)}`
      ].join('\n'),
      showCancel: false,
      confirmText: '关闭'
    })
  }
}) 