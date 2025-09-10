import * as VTable from '@visactor/vtable';

class BondMarketPanel {
    constructor() {
        this.table = null;
        this.isRunning = true;
        this.pendingRecords = [];
        this.updateInterval = null;
        this.bondData = [];
        this.selectedRowIndex = -1;
        this.recordIdCounter = 0;
        
        this.init();
    }

    // 生成单条债券记录
    generateBondRecord(timestamp = new Date()) {
        const bondTypes = ['国债', '企业债', '金融债', '可转债', '地方债'];
        const ratings = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A'];
        const exchanges = ['上交所', '深交所', '银行间'];
        
        this.recordIdCounter++;
        const bondCode = `${String(this.recordIdCounter).padStart(6, '0')}`;
        const bondType = bondTypes[Math.floor(Math.random() * bondTypes.length)];
        const rating = ratings[Math.floor(Math.random() * ratings.length)];
        const exchange = exchanges[Math.floor(Math.random() * exchanges.length)];
        
        const basePrice = 95 + Math.random() * 10;
        const prevClose = basePrice + (Math.random() - 0.5) * 2;
        const changeAmount = basePrice - prevClose;
        const changeRate = (changeAmount / prevClose * 100);
        
        return {
            id: this.recordIdCounter,
            timestamp: timestamp.toLocaleString(),
            bondCode: bondCode,
            bondName: `${bondType}${bondCode}`,
            bondType: bondType,
            exchange: exchange,
            issuer: `发行人${this.recordIdCounter}`,
            rating: rating,
            maturityDate: this.generateRandomDate(),
            faceValue: 100,
            currentPrice: basePrice.toFixed(3),
            yield: (2 + Math.random() * 5).toFixed(3),
            duration: (1 + Math.random() * 10).toFixed(2),
            convexity: (5 + Math.random() * 15).toFixed(2),
            volume: Math.floor(Math.random() * 1000000),
            turnover: (Math.random() * 100000000).toFixed(0),
            bidPrice: (basePrice - Math.random() * 0.5).toFixed(3),
            askPrice: (basePrice + Math.random() * 0.5).toFixed(3),
            bidVolume: Math.floor(Math.random() * 100000),
            askVolume: Math.floor(Math.random() * 100000),
            lastTradeTime: timestamp.toLocaleTimeString(),
            changeRate: changeRate.toFixed(3),
            changeAmount: changeAmount.toFixed(3),
            openPrice: (basePrice + (Math.random() - 0.5) * 1).toFixed(3),
            highPrice: (basePrice + Math.random() * 1).toFixed(3),
            lowPrice: (basePrice - Math.random() * 1).toFixed(3),
            prevClosePrice: prevClose.toFixed(3),
            avgPrice: (basePrice + (Math.random() - 0.5) * 0.5).toFixed(3),
            weightedAvgPrice: (basePrice + (Math.random() - 0.5) * 0.3).toFixed(3),
            totalValue: (Math.random() * 1000000000).toFixed(0),
            circulatingValue: (Math.random() * 800000000).toFixed(0),
            pe: (10 + Math.random() * 20).toFixed(2),
            pb: (1 + Math.random() * 3).toFixed(2),
            marketCap: (Math.random() * 10000000000).toFixed(0),
            status: Math.random() > 0.1 ? '正常' : '停牌'
        };
    }

    // 生成初始数据（少量）
    generateInitialData() {
        const bonds = [];
        // 初始只生成50条记录
        for (let i = 0; i < 50; i++) {
            bonds.push(this.generateBondRecord());
        }
        return bonds;
    }

    generateRandomDate() {
        const start = new Date();
        const end = new Date();
        end.setFullYear(start.getFullYear() + 10);
        const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
        return new Date(randomTime).toLocaleDateString();
    }

    // 定义表格列
    getColumns() {
        return [
            { field: 'timestamp', title: '时间戳', width: 150, sort: true },
            { field: 'bondCode', title: '债券代码', width: 100, sort: true },
            { field: 'bondName', title: '债券名称', width: 150 },
            { field: 'bondType', title: '债券类型', width: 80 },
            { field: 'exchange', title: '交易所', width: 80 },
            { field: 'issuer', title: '发行人', width: 120 },
            { field: 'rating', title: '评级', width: 60 },
            { field: 'currentPrice', title: '现价', width: 80, sort: true,
              style: {
                color: (args) => {
                  const change = parseFloat(args.dataValue) - parseFloat(args.table.getRecordByRowCol(args.col, args.row).prevClosePrice);
                  return change > 0 ? '#f56565' : change < 0 ? '#48bb78' : '#333';
                }
              }
            },
            { field: 'changeRate', title: '涨跌幅(%)', width: 90, sort: true,
              style: {
                color: (args) => {
                  const value = parseFloat(args.dataValue);
                  return value > 0 ? '#f56565' : value < 0 ? '#48bb78' : '#333';
                }
              }
            },
            { field: 'changeAmount', title: '涨跌额', width: 80,
              style: {
                color: (args) => {
                  const value = parseFloat(args.dataValue);
                  return value > 0 ? '#f56565' : value < 0 ? '#48bb78' : '#333';
                }
              }
            },
            { field: 'yield', title: '收益率(%)', width: 90, sort: true },
            { field: 'volume', title: '成交量', width: 100, sort: true },
            { field: 'turnover', title: '成交额', width: 120, sort: true },
            { field: 'bidPrice', title: '买价', width: 80 },
            { field: 'askPrice', title: '卖价', width: 80 },
            { field: 'bidVolume', title: '买量', width: 80 },
            { field: 'askVolume', title: '卖量', width: 80 },
            { field: 'openPrice', title: '开盘价', width: 80 },
            { field: 'highPrice', title: '最高价', width: 80 },
            { field: 'lowPrice', title: '最低价', width: 80 },
            { field: 'prevClosePrice', title: '昨收价', width: 80 },
            { field: 'avgPrice', title: '均价', width: 80 },
            { field: 'duration', title: '久期', width: 70 },
            { field: 'convexity', title: '凸性', width: 70 },
            { field: 'maturityDate', title: '到期日', width: 100 },
            { field: 'faceValue', title: '面值', width: 70 },
            { field: 'weightedAvgPrice', title: '加权均价', width: 90 },
            { field: 'totalValue', title: '总市值', width: 120 },
            { field: 'circulatingValue', title: '流通市值', width: 120 },
            { field: 'pe', title: 'PE', width: 60 },
            { field: 'pb', title: 'PB', width: 60 },
            { field: 'marketCap', title: '市值', width: 120 },
            { field: 'lastTradeTime', title: '最新时间', width: 100 },
            { field: 'status', title: '状态', width: 70 }
        ];
    }

    init() {
        this.bondData = this.generateInitialData();
        this.createTable();
        this.startUpdates();
        this.bindEvents();
    }

    createTable() {
        const option = {
            records: this.bondData,
            columns: this.getColumns(),
            widthMode: 'standard',
            heightMode: 'autoHeight',
            autoWrapText: false,
            hover: {
                highlightMode: 'row'
            },
            select: {
                highlightMode: 'row'
            },
            theme: VTable.themes.DEFAULT.extends({
                headerStyle: {
                    bgColor: '#f8f9fa',
                    color: '#333',
                    fontSize: 14,
                    fontWeight: 'bold'
                },
                bodyStyle: {
                    fontSize: 12,
                    color: '#333'
                },
                frameStyle: {
                    borderColor: '#e9ecef',
                    borderLineWidth: 1
                }
            })
        };

        this.table = new VTable.ListTable(document.getElementById('tableContainer'), option);
        
        // 绑定行点击事件
        this.table.on('click_cell', (args) => {
            if (args.row >= 0) {
                this.handleRowClick(args.row);
            }
        });
    }

    handleRowClick(rowIndex) {
        if (this.isRunning) {
            this.pauseUpdates();
            this.selectedRowIndex = rowIndex;
        } else {
            this.resumeUpdates();
            this.selectedRowIndex = -1;
        }
    }

    pauseUpdates() {
        this.isRunning = false;
        clearInterval(this.updateInterval);
        this.updateStatusUI();
    }

    resumeUpdates() {
        this.isRunning = true;
        this.selectedRowIndex = -1;
        
        // 应用所有待处理的记录
        if (this.pendingRecords.length > 0) {
            this.applyPendingRecords();
        }
        
        this.startUpdates();
        this.updateStatusUI();
    }

    startUpdates() {
        this.updateInterval = setInterval(() => {
            if (this.isRunning) {
                this.generateAndApplyUpdates();
            }
        }, 800);
    }

    generateAndApplyUpdates() {
        const newRecords = this.generateNewRecords();
        
        if (this.isRunning) {
            this.addNewRecords(newRecords);
        } else {
            this.pendingRecords.push(...newRecords);
            this.updateStatusUI();
        }
    }

    generateNewRecords() {
        const newRecords = [];
        const recordCount = Math.floor(Math.random() * 100) + 450; // 450-550条新记录
        const timestamp = new Date();
        
        for (let i = 0; i < recordCount; i++) {
            // 每条记录的时间戳略有不同，模拟真实场景
            const recordTimestamp = new Date(timestamp.getTime() + i * 2);
            newRecords.push(this.generateBondRecord(recordTimestamp));
        }
        
        return newRecords;
    }

    addNewRecords(newRecords) {
        // 将新记录添加到数据开头（最新的在顶部）
        this.bondData = [...newRecords, ...this.bondData];
        
        // 限制总记录数，避免内存过大（保留最新的10000条）
        if (this.bondData.length > 10000) {
            this.bondData = this.bondData.slice(0, 10000);
        }
        
        // 更新表格
        this.table.setRecords(this.bondData);
        
        // 自动滚动到顶部显示最新数据
        this.table.scrollToRow(0);
    }

    applyPendingRecords() {
        if (this.pendingRecords.length > 0) {
            this.addNewRecords(this.pendingRecords);
            this.pendingRecords = [];
        }
    }

    updateStatusUI() {
        const statusIndicator = document.getElementById('statusIndicator');
        const pendingCount = document.getElementById('pendingCount');
        const totalRecords = document.getElementById('totalRecords');
        
        // 更新总记录数
        if (totalRecords) {
            totalRecords.textContent = this.bondData.length.toLocaleString();
        }
        
        if (this.isRunning) {
            statusIndicator.textContent = '实时刷新中';
            statusIndicator.className = 'status-indicator status-running';
            pendingCount.style.display = 'none';
        } else {
            statusIndicator.textContent = `已暂停 - 点击继续刷新 (${this.pendingRecords.length}条待推送)`;
            statusIndicator.className = 'status-indicator status-paused';
            pendingCount.textContent = this.pendingRecords.length;
            pendingCount.style.display = 'block';
        }
    }

    bindEvents() {
        const statusIndicator = document.getElementById('statusIndicator');
        statusIndicator.addEventListener('click', () => {
            if (!this.isRunning) {
                this.resumeUpdates();
            }
        });
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new BondMarketPanel();
});