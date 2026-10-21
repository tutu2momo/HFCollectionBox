/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { InspectionOverview } from './components/InspectionOverview';
import { BoxDetailModal } from './components/BoxDetailModal';
import { DiagnosisDrawer } from './components/DiagnosisDrawer';
import { BatchInspectionHistoryView } from './components/BatchInspectionHistoryView';
import { HistoryRecords } from './components/HistoryRecords';
import { ModelRulesView } from './components/ModelRulesView';
import { DeviceBindingsView } from './components/DeviceBindingsView';
import { ArchitectureTopologyView } from './components/ArchitectureTopologyView';
import { DemoScenariosModal, DemoScenario } from './components/DemoScenariosModal';
import { 
  INITIAL_DEVICES, 
  INITIAL_DIAGNOSTIC_RECORDS, 
  MOCK_BOXES, 
  MOCK_BATCH_INSPECTION_HISTORY 
} from './mock/seedData';
import { 
  MedicalDevice, 
  DeviceLine, 
  DiagnosticRecord, 
  AcquisitionBox, 
  BatchInspectionHistoryRecord 
} from './types';
import { getNowTimeString } from './services/diagnosticEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [campus, setCampus] = useState<string>('ALL');

  // 1. 采集设备盒子主状态列表 (以采集盒为主实体)
  const [boxes, setBoxes] = useState<AcquisitionBox[]>(() => {
    const saved = localStorage.getItem('med_iot_boxes_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return MOCK_BOXES;
  });

  // 2. 医疗设备与线号列表
  const [devices, setDevices] = useState<MedicalDevice[]>(() => {
    const saved = localStorage.getItem('med_iot_devices');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_DEVICES;
  });

  // 3. 历史批量巡检批次记录 (总结正常与异常数据)
  const [batchHistory, setBatchHistory] = useState<BatchInspectionHistoryRecord[]>(() => {
    const saved = localStorage.getItem('med_iot_batch_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return MOCK_BATCH_INSPECTION_HISTORY;
  });

  // 4. 单项诊断历史记录 (存储每个线号的诊断证据与工单)
  const [diagHistory, setDiagHistory] = useState<DiagnosticRecord[]>(() => {
    const saved = localStorage.getItem('med_iot_diag_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_DIAGNOSTIC_RECORDS;
  });

  // 巡检状态控制
  const [hasRunInspection, setHasRunInspection] = useState<boolean>(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectProgress, setInspectProgress] = useState(0);
  const [lastInspectTime, setLastInspectTime] = useState('2026-10-20 20:10:00');

  // 采集盒详情弹窗
  const [selectedBox, setSelectedBox] = useState<AcquisitionBox | null>(null);
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);

  // 单项诊断抽屉
  const [isDiagDrawerOpen, setIsDiagDrawerOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<MedicalDevice | null>(null);
  const [selectedLine, setSelectedLine] = useState<DeviceLine | null>(null);

  // 演示案例弹窗
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // 本地持久化
  useEffect(() => {
    localStorage.setItem('med_iot_boxes_v3', JSON.stringify(boxes));
  }, [boxes]);

  useEffect(() => {
    localStorage.setItem('med_iot_devices', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('med_iot_batch_history', JSON.stringify(batchHistory));
  }, [batchHistory]);

  useEffect(() => {
    localStorage.setItem('med_iot_diag_history', JSON.stringify(diagHistory));
  }, [diagHistory]);

  // 第一阶段：执行一键批量巡检
  // 严格规则：只批量查询数据库近 5 分钟数据量和最后数据时间，不执行 Ping 或连接盒子！
  const handleRunBatchInspection = () => {
    if (isInspecting) return;
    setIsInspecting(true);
    setInspectProgress(10);

    const interval = setInterval(() => {
      setInspectProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setInspectProgress(100);
            setIsInspecting(false);
            const nowTime = getNowTimeString();
            setLastInspectTime(nowTime);
            setHasRunInspection(true);

            // 1. 更新采集盒本次巡检状态
            const updatedBoxes = boxes.map(b => {
              let updatedStatus = b.status;
              if (b.status === 'NORMAL') {
                updatedStatus = 'NORMAL';
              }
              return {
                ...b,
                currentStatus: updatedStatus,
                lastInspectionTime: nowTime
              };
            });
            setBoxes(updatedBoxes);

            // 2. 统计正常与异常生成新的历史批次记录
            const normalCount = updatedBoxes.filter(b => b.status === 'NORMAL').length;
            const abnormalCount = updatedBoxes.length - normalCount;
            const partialCount = updatedBoxes.filter(b => b.status === 'PARTIAL_NO_DATA').length;
            const allNoDataCount = updatedBoxes.filter(b => b.status === 'ALL_NO_DATA').length;
            const queryErrCount = updatedBoxes.filter(b => b.status === 'QUERY_ERROR').length;

            const newBatchRecord: BatchInspectionHistoryRecord = {
              id: `INS-${Date.now().toString().slice(-8)}`,
              inspectTime: nowTime,
              operator: '值班工程师-张工 (一键手动巡检)',
              scopeCampus: campus === 'ALL' ? '全部院区' : campus,
              scopeDept: '第一手术部 / 第二手术部 / PACU / ICU',
              durationMs: 124,
              totalBoxes: updatedBoxes.length,
              totalDevices: devices.length,
              totalLines: devices.reduce((sum, d) => sum + d.lines.length, 0),
              normalCount,
              abnormalCount,
              partialNoDataCount: partialCount,
              allNoDataCount,
              queryErrorCount: queryErrCount,
              anomalousSnapshots: updatedBoxes
                .filter(b => b.status !== 'NORMAL')
                .map(b => ({
                  boxId: b.id,
                  boxIp: b.ip,
                  room: b.room,
                  deviceName: b.name,
                  lineId: b.connectedLineIds[0] || 'L01',
                  issueSummary: b.notes || '近5分钟无有效数据入库',
                  status: b.status
                }))
            };

            setBatchHistory(prev => [newBatchRecord, ...prev]);

            // 3. 增量更新设备近5分数据点
            setDevices(prevDevs => prevDevs.map(dev => {
              if (dev.aggregateStatus === 'NORMAL') {
                return {
                  ...dev,
                  lines: dev.lines.map(l => ({
                    ...l,
                    dataCount5Min: l.dataCount5Min + Math.floor(Math.random() * 5 + 1),
                    lastDataTime: nowTime
                  }))
                };
              }
              return dev;
            }));
          }, 350);
          return 90;
        }
        return prev + 25;
      });
    }, 150);
  };

  // 查看采集盒详情
  const handleOpenBoxDetail = (box: AcquisitionBox) => {
    setSelectedBox(box);
    setIsBoxModalOpen(true);
  };

  // 第二阶段：打开单项诊断抽屉 (针对异常情况)
  const handleOpenDiagnosis = (device: MedicalDevice, line: DeviceLine) => {
    setSelectedDevice(device);
    setSelectedLine(line);
    setIsDiagDrawerOpen(true);
  };

  // 保存新的诊断结果并同步更新状态
  const handleSaveDiagnosticRecord = (newRecord: DiagnosticRecord) => {
    setDiagHistory(prev => [newRecord, ...prev.filter(r => r.id !== newRecord.id)]);

    // 若现场处置解决，同步更新设备和盒子状态
    if (newRecord.handlingStatus === 'RESOLVED' || newRecord.conclusionType === 'IDLE_EXPECTED') {
      setDevices(prevDevs => prevDevs.map(d => {
        if (d.id === newRecord.deviceId) {
          const updatedLines = d.lines.map(l => {
            if (l.lineId === newRecord.targetLineId) {
              return {
                ...l,
                lastDiagnosisTime: newRecord.recordTime,
                lastDiagnosisResult: newRecord.conclusionTitle
              };
            }
            return l;
          });
          return { ...d, lines: updatedLines };
        }
        return d;
      }));
    }
  };

  // 演示案例快速直达
  const handleSelectScenario = (scenario: DemoScenario) => {
    setIsDemoModalOpen(false);
    setActiveTab('overview');

    const dev = devices.find(d => d.id === scenario.deviceId);
    if (!dev) return;

    const line = dev.lines.find(l => l.lineId === scenario.targetLineId) || dev.lines[0];
    setTimeout(() => {
      handleOpenDiagnosis(dev, line);
    }, 150);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-800 antialiased font-sans">
      {/* 侧边导航栏 */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        devices={devices} 
      />

      {/* 右侧主视窗 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部工具栏 */}
        <Header 
          activeTab={activeTab}
          campus={campus}
          setCampus={setCampus}
          isInspecting={isInspecting}
          onRunBatchInspection={handleRunBatchInspection}
          onOpenDemoScenarios={() => setIsDemoModalOpen(true)}
          onOpenTopology={() => setActiveTab('topology')}
        />

        {/* 主视窗主体 */}
        <main className="flex-1 overflow-y-auto p-5">
          {/* 1. 采集盒批量巡检工作台 (以采集盒为主视图，巡检前后对比) */}
          {activeTab === 'overview' && (
            <InspectionOverview 
              boxes={boxes}
              devices={devices}
              onOpenBoxDetail={handleOpenBoxDetail}
              onOpenDiagnosis={handleOpenDiagnosis}
              onRunBatchInspection={handleRunBatchInspection}
              isInspecting={isInspecting}
              inspectProgress={inspectProgress}
              lastInspectTime={lastInspectTime}
              hasRunInspection={hasRunInspection}
              selectedCampus={campus}
              onSelectCampus={setCampus}
            />
          )}

          {/* 2. 历史巡检记录列表 (总结正常与异常数据) */}
          {activeTab === 'batch_history' && (
            <BatchInspectionHistoryView 
              historyRecords={batchHistory}
              devices={devices}
              onOpenDiagnosis={handleOpenDiagnosis}
            />
          )}

          {/* 3. 诊断与处理记录 (以采集设备盒子为主) */}
          {activeTab === 'diag_history' && (
            <HistoryRecords 
              boxes={boxes}
              records={diagHistory}
              devices={devices}
              onOpenDiagnosis={handleOpenDiagnosis}
              onUpdateRecord={handleSaveDiagnosticRecord}
              onViewRecord={(rec) => {
                const dev = devices.find(d => d.id === rec.deviceId);
                const line = dev?.lines.find(l => l.lineId === rec.targetLineId);
                if (dev && line) {
                  handleOpenDiagnosis(dev, line);
                }
              }}
            />
          )}

          {/* 4. 设备与线号映射台账 (表单形式展示与在线编辑绑定) */}
          {activeTab === 'bindings' && (
            <DeviceBindingsView 
              devices={devices}
              onUpdateDevices={setDevices}
              onOpenDiagnosis={handleOpenDiagnosis}
            />
          )}

          {/* 5. 设备型号规则知识库 */}
          {activeTab === 'rules' && (
            <ModelRulesView />
          )}

          {/* 6. 物理与数据采集架构原理 */}
          {activeTab === 'topology' && (
            <ArchitectureTopologyView />
          )}
        </main>
      </div>

      {/* 采集盒详情弹窗 (查看MAC地址、连接线号、最后数据时间等) */}
      <BoxDetailModal 
        isOpen={isBoxModalOpen}
        onClose={() => setIsBoxModalOpen(false)}
        box={selectedBox}
        devices={devices}
        onStartDiagnosis={handleOpenDiagnosis}
      />

      {/* 单项诊断与处理建议抽屉 (针对异常情况) */}
      <DiagnosisDrawer 
        isOpen={isDiagDrawerOpen}
        onClose={() => setIsDiagDrawerOpen(false)}
        device={selectedDevice}
        targetLine={selectedLine}
        allDevices={devices}
        onSaveRecord={handleSaveDiagnosticRecord}
      />

      {/* 演示案例切换器 (13组业务全分支) */}
      <DemoScenariosModal 
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectScenario={handleSelectScenario}
      />
    </div>
  );
}
