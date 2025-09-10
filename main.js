import * as VTable from '@visactor/vtable';

class BondMarketPanel {
    constructor() {
        this.table = null;
        this.isRunning = true;
        this.pendingRecords = [];
        this.updateInterval = null;
        this.bondData = [];
        this.selectedRowIndex = -1;
        this.mockupData = null;
        
        this.init();
    }

    // 加载模拟数据
    async loadMockupData() {
        try {
            const response = await fetch('./mockup-data.json');
            const text = await response.text();
            this.mockupData = JSON.parse(text);
            console.log(`加载了 ${this.mockupData.data.length} 条模拟数据`);
        } catch (error) {
            console.error('加载模拟数据失败:', error);
            this.mockupData = { data: [] };
        }
    }

    // 基于真实数据结构生成记录
    generateBondRecord(timestamp = new Date()) {
        if (!this.mockupData || this.mockupData.data.length === 0) {
            return this.generateFallbackRecord(timestamp);
        }

        // 随机选择一个模板记录
        const template = this.mockupData.data[Math.floor(Math.random() * this.mockupData.data.length)];
        const baseInfo = template.bond_base_info;
        
        // 生成价格相关的随机变动
        const baseBuyPrice = template.buy_net_price || (100 + Math.random() * 10);
        const baseSellPrice = template.sell_net_price || (baseBuyPrice + Math.random() * 0.5);
        const priceVariation = (Math.random() - 0.5) * 2; // ±2的价格波动
        
        return {
            // 基础信息
            windcode: baseInfo.windcode,
            symbol_name: baseInfo.symbol_name,
            bond_type_name: baseInfo.bond_type_name,
            trade_exchange: baseInfo.trade_exchage,
            issuer_name: baseInfo.issuer_name,
            
            // 价格信息
            current_price: (baseBuyPrice + priceVariation).toFixed(4),
            buy_net_price: template.buy_net_price ? (template.buy_net_price + priceVariation * 0.5).toFixed(4) : null,
            sell_net_price: template.sell_net_price ? (template.sell_net_price + priceVariation * 0.5).toFixed(4) : null,
            net_price_csi: (baseInfo.net_price_csi + priceVariation * 0.3).toFixed(4),
            
            // 收益率信息
            buy_ytm: template.buy_ytm ? (template.buy_ytm + (Math.random() - 0.5) * 0.1).toFixed(4) : null,
            sell_ytm: template.sell_ytm ? (template.sell_ytm + (Math.random() - 0.5) * 0.1).toFixed(4) : null,
            yield_csi: (baseInfo.yield_csi + (Math.random() - 0.5) * 0.05).toFixed(4),
            gjsyl: (baseInfo.gjsyl + (Math.random() - 0.5) * 0.05).toFixed(4),
            
            // 交易量信息
            buy_amount: template.buy_amount ? Math.floor(template.buy_amount * (0.8 + Math.random() * 0.4)) : null,
            sell_amount: template.sell_amount ? Math.floor(template.sell_amount * (0.8 + Math.random() * 0.4)) : null,
            holding_amount: Math.floor(baseInfo.holding_amount * (0.95 + Math.random() * 0.1)),
            
            // 期限信息
            residual_duration: baseInfo.residual_duration,
            residual_duration_str: baseInfo.residual_duration_str,
            end_date: baseInfo.end_date,
            narrow_matu: baseInfo.narrow_matu,
            
            // 评级信息
            csi_credit_rating: baseInfo.csi_credit_rating,
            cnbd_credit_rating: baseInfo.cnbd_credit_rating,
            intergrade_bond: baseInfo.intergrade_bond,
            
            // 其他重要字段
            cur_coupon_rate: baseInfo.cur_coupon_rate,
            curve_deviation: (baseInfo.curve_deviation + (Math.random() - 0.5) * 0.001).toFixed(6),
            settle_speed: template.settle_speed,
            transact_time: timestamp.toLocaleString(),
            
            // 风险指标
            pa_zscore: (baseInfo.pa_zscore + (Math.random() - 0.5) * 0.1).toFixed(6),
            risk_warin: baseInfo.risk_warin,
            
            // 状态信息
            has_position: baseInfo.has_position,
            has_symbol_position: baseInfo.has_symbol_position,
            bond_reserve_status: baseInfo.bond_reserve_status,
            
            // 行业分类
            fix_wind_industry: baseInfo.fix_wind_industry,
            sys_type: baseInfo.sys_type,
            
            // 差价信息
            buy_ytmdiff: template.buy_ytmdiff,
            sell_ytmdiff: template.sell_ytmdiff,
            buy_ytm_diff_csi: template.buy_ytm_diff_csi,
            sell_ytm_diff_csi: template.sell_ytm_diff_csi
        };
    }

    // 备用数据生成方法
    generateFallbackRecord(timestamp) {
        const bondTypes = ['国债', '国开', '企业债', '金融债'];
        const exchanges = ['银行间', '上交所', '深交所'];
        
        const bondType = bondTypes[Math.floor(Math.random() * bondTypes.length)];
        const basePrice = 95 + Math.random() * 15;
        
        return {
            windcode: `${Math.floor(Math.random() * 900000 + 100000)}.IB`,
            symbol_name: `${bondType}${Math.floor(Math.random() * 100)}`,
            bond_type_name: bondType,
            trade_exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
            issuer_name: `发行人${Math.floor(Math.random() * 1000)}`,
            current_price: basePrice.toFixed(4),
            yield_csi: (1 + Math.random() * 4).toFixed(4),
            transact_time: timestamp.toLocaleString()
        };
    }

    // 生成初始数据（少量）
    generateInitialData() {
        const bonds = [];
        // 初始生成43条记录，与模拟数据保持一致
        const initialCount = this.mockupData ? this.mockupData.data.length : 43;
        for (let i = 0; i < initialCount; i++) {
            bonds.push(this.generateBondRecord());
        }
        return bonds;
    }



    // 定义表格列 - 基于真实数据结构
    getColumns() {
        return [
            { field: 'transact_time', title: '交易时间', width: 150, sort: true },
            { field: 'windcode', title: '债券代码', width: 120, sort: true },
            { field: 'symbol_name', title: '债券名称', width: 150 },
            { field: 'bond_type_name', title: '债券类型', width: 80 },
            { field: 'trade_exchange', title: '交易所', width: 80 },
            { field: 'issuer_name', title: '发行人', width: 150 },
            
            // 价格相关
            { field: 'current_price', title: '现价', width: 90, sort: true,
              style: {
                color: '#2563eb',
                fontWeight: 'bold'
              }
            },
            { field: 'buy_net_price', title: '买入净价', width: 90, sort: true },
            { field: 'sell_net_price', title: '卖出净价', width: 90, sort: true },
            { field: 'net_price_csi', title: 'CSI净价', width: 90 },
            
            // 收益率相关
            { field: 'buy_ytm', title: '买入收益率', width: 100, sort: true,
              style: {
                color: (args) => {
                  const value = parseFloat(args.dataValue);
                  return value > 2 ? '#dc2626' : value > 1 ? '#ea580c' : '#16a34a';
                }
              }
            },
            { field: 'sell_ytm', title: '卖出收益率', width: 100, sort: true,
              style: {
                color: (args) => {
                  const value = parseFloat(args.dataValue);
                  return value > 2 ? '#dc2626' : value > 1 ? '#ea580c' : '#16a34a';
                }
              }
            },
            { field: 'yield_csi', title: 'CSI收益率', width: 100, sort: true },
            { field: 'gjsyl', title: '国债收益率', width: 100 },
            
            // 差价信息
            { field: 'buy_ytmdiff', title: '买入利差(BP)', width: 110,
              style: {
                color: (args) => {
                  const value = parseFloat(args.dataValue);
                  return value > 0 ? '#dc2626' : '#16a34a';
                }
              }
            },
            { field: 'sell_ytmdiff', title: '卖出利差(BP)', width: 110,
              style: {
                color: (args) => {
                  const value = parseFloat(args.dataValue);
                  return value > 0 ? '#dc2626' : '#16a34a';
                }
              }
            },
            
            // 交易量信息
            { field: 'buy_amount', title: '买入金额', width: 120, sort: true,
              customRender: (args) => {
                const value = args.dataValue;
                return value ? (value / 100000000).toFixed(2) + '亿' : '-';
              }
            },
            { field: 'sell_amount', title: '卖出金额', width: 120, sort: true,
              customRender: (args) => {
                const value = args.dataValue;
                return value ? (value / 100000000).toFixed(2) + '亿' : '-';
              }
            },
            { field: 'holding_amount', title: '持仓金额', width: 120,
              customRender: (args) => {
                const value = args.dataValue;
                return value ? (value / 100000000).toFixed(2) + '亿' : '-';
              }
            },
            
            // 期限信息
            { field: 'residual_duration_str', title: '剩余期限', width: 100 },
            { field: 'narrow_matu', title: '期限分类', width: 100 },
            { field: 'end_date', title: '到期日', width: 100 },
            
            // 评级信息
            { field: 'csi_credit_rating', title: 'CSI评级', width: 80 },
            { field: 'cnbd_credit_rating', title: 'CNBD评级', width: 80 },
            { field: 'intergrade_bond', title: '债券评级', width: 80 },
            
            // 其他重要信息
            { field: 'cur_coupon_rate', title: '票面利率(%)', width: 110 },
            { field: 'curve_deviation', title: '曲线偏离度', width: 110,
              style: {
                color: (args) => {
                  const value = Math.abs(parseFloat(args.dataValue));
                  return value > 0.02 ? '#dc2626' : value > 0.01 ? '#ea580c' : '#16a34a';
                }
              }
            },
            { field: 'settle_speed', title: '结算速度', width: 90 },
            { field: 'pa_zscore', title: 'Z-Score', width: 90 },
            { field: 'fix_wind_industry', title: '行业分类', width: 100 },
            { field: 'sys_type', title: '系统类型', width: 100 },
            
            // 状态信息
            { field: 'has_position', title: '有持仓', width: 80,
              customRender: (args) => args.dataValue ? '是' : '否'
            },
            { field: 'has_symbol_position', title: '有券种持仓', width: 100,
              customRender: (args) => args.dataValue ? '是' : '否'
            },
            { field: 'bond_reserve_status', title: '储备状态', width: 90 }
        ];
    }

    async init() {
        await this.loadMockupData();
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
            heightMode: 'standard', // 使用固定高度以启用虚拟滚动
            height: 600,
            autoWrapText: false,
            // 启用虚拟滚动以提升性能
            scrollStyle: {
                scrollRailColor: 'rgba(100, 100, 100, 0.2)',
                scrollSliderColor: 'rgba(100, 100, 100, 0.5)',
                scrollSliderCornerRadius: 2,
                hoverOn: false,
                barToSide: false
            },
            // 优化渲染性能
            animationAppear: false,
            hover: {
                highlightMode: 'row'
            },
            select: {
                highlightMode: 'row'
            },
            // 冻结表头
            frozenColCount: 3, // 冻结前3列（时间、代码、名称）
            theme: VTable.themes.DEFAULT.extends({
                headerStyle: {
                    bgColor: '#f8f9fa',
                    color: '#333',
                    fontSize: 13,
                    fontWeight: 'bold',
                    borderColor: '#dee2e6'
                },
                bodyStyle: {
                    fontSize: 11,
                    color: '#333',
                    borderColor: '#f1f3f4'
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
        // 模拟真实场景：每800ms推送43条记录（与模拟数据一致）
        const recordCount = this.mockupData ? this.mockupData.data.length : 43;
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
        
        // 限制总记录数，避免内存过大（保留最新的5000条）
        // 考虑到每条记录有100+字段，适当减少缓存数量
        if (this.bondData.length > 5000) {
            this.bondData = this.bondData.slice(0, 5000);
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
        
        // 更新内存使用情况
        this.updatePerformanceStats();
        
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

    updatePerformanceStats() {
        if (this.bondData.length === 0) return;
        
        // 估算内存使用
        const recordSize = JSON.stringify(this.bondData[0]).length;
        const totalMemoryKB = (this.bondData.length * recordSize / 1024).toFixed(1);
        
        // 更新UI显示
        const memoryElement = document.getElementById('memoryUsage');
        const fieldCountElement = document.getElementById('fieldCount');
        
        if (memoryElement) {
            memoryElement.textContent = totalMemoryKB + 'KB';
        }
        
        if (fieldCountElement) {
            fieldCountElement.textContent = Object.keys(this.bondData[0]).length;
        }
        
        // 在控制台输出详细性能信息
        if (this.bondData.length % 200 === 0) { // 每200条记录输出一次
            console.log(`📊 性能统计:
                - 记录数: ${this.bondData.length.toLocaleString()}
                - 估算内存: ${totalMemoryKB}KB
                - 单条记录: ~${recordSize}字节
                - 字段数: ${Object.keys(this.bondData[0]).length}
                - 推送频率: 43条/800ms
                - 数据源: ${this.mockupData ? '真实模拟数据' : '生成数据'}
            `);
            
            // 性能建议
            if (parseFloat(totalMemoryKB) > 5000) {
                console.warn('⚠️  内存使用较高，建议减少缓存记录数量');
            }
            
            if (Object.keys(this.bondData[0]).length > 50) {
                console.info('💡 字段数量较多，已启用虚拟滚动优化性能');
            }
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