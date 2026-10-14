/**
 * 题库扩容（第八批）：DCN · 数据中心架构 / EVPN / SDN / VXLAN 网关 / Clos
 *
 * 目标：每个考点 单选>=3 / 多选>=4 / 判断>=4；EVPN 与 Clos 为 DCN 方向
 * 省赛权重较高的考点，额外加码。标签口径见 quizzes-expand-a.ts。
 */
import type { IQuizQuestion } from './quizzes'

export const EXTRA_QUIZZES_EXPAND_H: IQuizQuestion[] = [
  // ==================== dcn-arch  数据中心网络架构 ====================
  {
    id: 'ex-dcn-001', type: 'multiple', difficulty: 'IP',
    question: '关于数据中心网络的特点，以下说法正确的有？',
    options: [
      '东西向流量（服务器之间）占比很大',
      '要求低时延与大二层能力',
      '需要支持多租户隔离',
      '以南北向流量（进出数据中心）为绝对主体',
    ],
    answer: ['东西向流量（服务器之间）占比很大', '要求低时延与大二层能力', '需要支持多租户隔离'],
    explanation: '数据中心内部服务器之间交互极为频繁，东西向流量才是主体，这正是传统三层架构在该场景失效的根本原因。',
    knowledgeId: 'dcn-arch', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-002', type: 'multiple', difficulty: 'IP',
    question: '关于传统三层架构与 Spine-Leaf 架构的对比，以下说法正确的有？',
    options: [
      '传统三层架构为接入层、汇聚层、核心层',
      '数据中心东西向流量大时，传统架构容易出现瓶颈',
      'Spine-Leaf 更适合作为数据中心主流架构',
      'Spine-Leaf 中 Leaf 之间需要直连以保证互通',
    ],
    answer: [
      '传统三层架构为接入层、汇聚层、核心层',
      '数据中心东西向流量大时，传统架构容易出现瓶颈',
      'Spine-Leaf 更适合作为数据中心主流架构',
    ],
    explanation: 'Spine-Leaf 中 Leaf 之间不直接互联，必须经 Spine 转发（即"任意 Leaf 间一跳 Spine"），因此「Spine-Leaf 中 Leaf 之间需要直连以保证互通」这一说法错误。',
    knowledgeId: 'dcn-arch', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-003', type: 'multiple', difficulty: 'IE',
    question: '关于服务器接入方式与存储网络，以下说法正确的有？',
    options: [
      'ToR 指机架顶接入，每机架顶部部署交换机',
      'EoR 指列末集中接入',
      'iSCSI 是在 IP 网络上承载 SCSI 的存储方案',
      'NAS 只能通过 FC 网络对外提供存储',
    ],
    answer: [
      'ToR 指机架顶接入，每机架顶部部署交换机',
      'EoR 指列末集中接入',
      'iSCSI 是在 IP 网络上承载 SCSI 的存储方案',
    ],
    explanation: 'NAS 是通过以太网与 NFS/CIFS 等文件协议提供存储，与 FC 网络无关，因此「NAS 只能通过 FC 网络对外提供存储」这一说法错误。',
    knowledgeId: 'dcn-arch', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-004', type: 'judge', difficulty: 'IP',
    question: '数据中心网络以东西向流量为主。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '分布式计算与存储复制使服务器之间流量激增，这是 Spine-Leaf 与 VXLAN 等技术成为数据中心标配的根本动因。',
    knowledgeId: 'dcn-arch', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-005', type: 'judge', difficulty: 'IP',
    question: '在 Spine-Leaf 架构中，任意两台 Leaf 之间的流量只需经过一跳 Spine。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '这一特性使时延低且可预测，是 Spine-Leaf 相比传统多层架构的关键优势。',
    knowledgeId: 'dcn-arch', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-006', type: 'judge', difficulty: 'IP',
    question: '传统三层架构在数据中心东西向流量为主的场景下存在明显瓶颈。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '汇聚层与核心层需要承载大量东西向绕行流量，容易形成拥塞点，因此被扁平化的 Spine-Leaf 取代。',
    knowledgeId: 'dcn-arch', direction: 'dcn', tag: 'hot',
  },

  // ==================== dcn-evpn  EVPN ====================
  {
    id: 'ex-dcn-007', type: 'multiple', difficulty: 'IE',
    question: '关于 EVPN 带来的价值，以下说法正确的有？',
    options: [
      '通过 BGP 控制面学习 MAC，减少数据面泛洪',
      '支持 ARP 抑制/代理，抑制广播风暴',
      '支持分布式网关与多活网关',
      'EVPN 只能作为数据面封装协议使用',
    ],
    answer: [
      '通过 BGP 控制面学习 MAC，减少数据面泛洪',
      '支持 ARP 抑制/代理，抑制广播风暴',
      '支持分布式网关与多活网关',
    ],
    explanation: 'EVPN 是 VXLAN 的**控制面**（用 BGP 分发 MAC/IP 与路由信息），数据面封装由 VXLAN 完成，因此「EVPN 只能作为数据面封装协议使用」这一说法把角色说反了。',
    knowledgeId: 'dcn-evpn', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-008', type: 'multiple', difficulty: 'IE',
    question: '关于 EVPN 的路由类型，以下说法正确的有？',
    options: [
      'Type2 用于通告主机的 MAC/IP 地址信息',
      'Type3 用于 VTEP 发现并形成头端复制列表',
      'Type5 用于通告 IP 前缀路由',
      'Type2 用于以太网段 DF 选举',
    ],
    answer: [
      'Type2 用于通告主机的 MAC/IP 地址信息',
      'Type3 用于 VTEP 发现并形成头端复制列表',
      'Type5 用于通告 IP 前缀路由',
    ],
    explanation: 'DF（指定转发者）选举使用的是 Type4 路由，因此「Type2 用于以太网段 DF 选举」这一说法错误。五种路由类型的职责是 EVPN 的核心考点。',
    knowledgeId: 'dcn-evpn', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-009', type: 'multiple', difficulty: 'IE',
    question: '关于 EVPN 的工作流程，以下说法正确的有？',
    options: [
      'VTEP 之间先建立 BGP EVPN 邻居',
      '通过 Type3 路由发现其他 VTEP 并建立隧道',
      '主机上线后通过 Type2 路由通告其 MAC/IP',
      'EVPN 依赖数据面泛洪来学习远端 MAC',
    ],
    answer: [
      'VTEP 之间先建立 BGP EVPN 邻居',
      '通过 Type3 路由发现其他 VTEP 并建立隧道',
      '主机上线后通过 Type2 路由通告其 MAC/IP',
    ],
    explanation: '"控制面学习"正是 EVPN 的核心价值，它取代了传统 VXLAN 依赖数据面泛洪的学习方式，因此「EVPN 依赖数据面泛洪来学习远端 MAC」这一说法错误。',
    knowledgeId: 'dcn-evpn', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-010', type: 'judge', difficulty: 'IE',
    question: 'EVPN 使用 BGP 的多协议扩展承载，AFI 为 25、SAFI 为 70。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'AFI=25（L2VPN）与 SAFI=70（EVPN）是 EVPN 的地址族标识，属于较深入的识记点。',
    knowledgeId: 'dcn-evpn', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-011', type: 'judge', difficulty: 'IE',
    question: 'EVPN 可通过控制面分发 MAC 信息，替代数据面的泛洪学习。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '这是 EVPN 相比传统 VXLAN 最实质的改进：MAC 由 BGP 直接告知，无需"未知单播泛洪—学习"的过程。',
    knowledgeId: 'dcn-evpn', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-012', type: 'judge', difficulty: 'IE',
    question: 'EVPN 分布式网关通常使用 Anycast IP 作为网关地址。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '所有 Leaf 配置相同的网关 IP 与 MAC，使主机无论接入哪台 Leaf 都能"就近"获得相同的网关，从而支持虚拟机无感迁移。',
    knowledgeId: 'dcn-evpn', direction: 'dcn', tag: 'hot',
  },

  // ==================== dcn-sdn-basic  SDN基础 ====================
  {
    id: 'ex-dcn-013', type: 'multiple', difficulty: 'IP',
    question: '关于 SDN 的核心特征，以下说法正确的有？',
    options: [
      '控制平面与转发平面分离',
      '采用集中式控制，掌握全局视图',
      '提供开放可编程接口',
      '由数据平面负责复杂的路由决策',
    ],
    answer: ['控制平面与转发平面分离', '采用集中式控制，掌握全局视图', '提供开放可编程接口'],
    explanation: '复杂决策被上移到控制平面，数据平面只负责按流表转发，因此「由数据平面负责复杂的路由决策」这一说法恰好本末倒置。',
    knowledgeId: 'dcn-sdn-basic', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-014', type: 'multiple', difficulty: 'IP',
    question: '关于 OpenFlow，以下说法正确的有？',
    options: [
      '是 SDN 控制器与转发设备之间的南向协议',
      '控制器通过下发流表来指导转发',
      '流表包含匹配字段、动作与计数器',
      'OpenFlow 属于北向接口',
    ],
    answer: [
      '是 SDN 控制器与转发设备之间的南向协议',
      '控制器通过下发流表来指导转发',
      '流表包含匹配字段、动作与计数器',
    ],
    explanation: '连接控制器与设备的属于**南向**接口；北向接口连接控制器与上层应用，因此「OpenFlow 属于北向接口」这一说法错误。',
    knowledgeId: 'dcn-sdn-basic', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-015', type: 'multiple', difficulty: 'IP',
    question: '关于 SDN 面临的挑战，以下说法正确的有？',
    options: [
      '集中式控制器可能成为性能瓶颈',
      '控制器容易成为安全攻击的重点目标',
      '需要与现有网络长期兼容演进',
      'SDN 架构不存在任何安全或可靠性风险',
    ],
    answer: ['集中式控制器可能成为性能瓶颈', '控制器容易成为安全攻击的重点目标', '需要与现有网络长期兼容演进'],
    explanation: '"集中"本身就是一把双刃剑：带来全局视图的同时也带来了单点风险，因此「SDN 架构不存在任何安全或可靠性风险」这一说法错误。',
    knowledgeId: 'dcn-sdn-basic', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-016', type: 'judge', difficulty: 'IP',
    question: 'SDN 的三要素可概括为转控分离、集中控制、开放接口。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '这三句话是 SDN 最凝练的定义，考试中常以"下列哪项不属于 SDN 特征"的形式反向考查。',
    knowledgeId: 'dcn-sdn-basic', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-017', type: 'judge', difficulty: 'IP',
    question: 'OpenFlow 属于 SDN 的南向接口协议。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '除 OpenFlow 外，NETCONF、OVSDB、BGP-EVPN 等也可作为南向接口，用于控制器与设备之间的交互。',
    knowledgeId: 'dcn-sdn-basic', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-018', type: 'judge', difficulty: 'IP',
    question: 'SDN 控制器不会成为单点故障。',
    options: ['正确', '错误'], answer: '错误',
    explanation: '单机部署的控制器一旦故障，全网策略下发即中断，因此实际部署常采用控制器集群提升可靠性。',
    knowledgeId: 'dcn-sdn-basic', direction: 'dcn', tag: 'hot',
  },

  // ==================== dcn-vxlan-gateway  VXLAN 网关 ====================
  {
    id: 'ex-dcn-019', type: 'multiple', difficulty: 'IE',
    question: '关于集中式网关与分布式网关的对比，以下说法正确的有？',
    options: [
      '集中式网关部署在 Spine 或专用网关设备上',
      '集中式网关可能存在流量绕行与性能瓶颈',
      '分布式网关下沉到 Leaf，实现就近转发',
      '分布式网关配置更简单、安全策略更集中',
    ],
    answer: [
      '集中式网关部署在 Spine 或专用网关设备上',
      '集中式网关可能存在流量绕行与性能瓶颈',
      '分布式网关下沉到 Leaf，实现就近转发',
    ],
    explanation: '分布式网关的代价正是配置更复杂、安全策略分散在各 Leaf 上，因此「分布式网关配置更简单、安全策略更集中」这一说法描述与事实相反。',
    knowledgeId: 'dcn-vxlan-gateway', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-020', type: 'multiple', difficulty: 'IE',
    question: '关于 Anycast Gateway，以下说法正确的有？',
    options: [
      '多台 Leaf 配置相同的网关 IP 与 MAC',
      '主机无论接入哪台 Leaf，看到的网关都相同',
      '通常需配合主机路由（/32）保证流量路径对称',
      'Anycast 网关要求每台 Leaf 使用互不相同的网关 IP',
    ],
    answer: [
      '多台 Leaf 配置相同的网关 IP 与 MAC',
      '主机无论接入哪台 Leaf，看到的网关都相同',
      '通常需配合主机路由（/32）保证流量路径对称',
    ],
    explanation: 'Anycast 的意义就在于"处处相同"，虚拟机迁移后无需更换网关，因此「Anycast 网关要求每台 Leaf 使用互不相同的网关 IP」这一说法与设计目的矛盾。',
    knowledgeId: 'dcn-vxlan-gateway', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-021', type: 'judge', difficulty: 'IE',
    question: '分布式网关更适合东西向流量为主的中大型数据中心。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '东西向流量本地转发可避免绕行到集中网关，显著降低时延并缓解网关压力。',
    knowledgeId: 'dcn-vxlan-gateway', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-022', type: 'judge', difficulty: 'IE',
    question: '集中式网关不存在流量次优路径的问题。',
    options: ['正确', '错误'], answer: '错误',
    explanation: '集中式网关强制所有跨子网流量绕行到网关设备，正是次优路径（绕行）的典型来源，这也是分布式网关出现的动因。',
    knowledgeId: 'dcn-vxlan-gateway', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-023', type: 'judge', difficulty: 'IE',
    question: '对称 IRB 要求进出流量经过同一台网关设备。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '对称/非对称 IRB 的差异主要体现在流量路径是否一致，工程上常通过主机路由保证对称性以满足安全设备回程要求。',
    knowledgeId: 'dcn-vxlan-gateway', direction: 'dcn', tag: 'hot',
  },

  // ==================== dcn-clos  Spine-Leaf 架构 ====================
  {
    id: 'ex-dcn-024', type: 'multiple', difficulty: 'IP',
    question: '关于 Spine-Leaf 架构，以下说法正确的有？',
    options: [
      'Spine 与 Leaf 之间采用全互联',
      '任意两台 Leaf 之间的流量经过一跳 Spine',
      '带宽利用率高，易于横向扩展',
      'Leaf 之间需要互连以承载东西向流量',
    ],
    answer: [
      'Spine 与 Leaf 之间采用全互联',
      '任意两台 Leaf 之间的流量经过一跳 Spine',
      '带宽利用率高，易于横向扩展',
    ],
    explanation: 'Leaf 之间不直接互连，所有跨 Leaf 流量都经 Spine 转发，这正是该架构"时延可预测"的原因，因此「Leaf 之间需要互连以承载东西向流量」这一说法错误。',
    knowledgeId: 'dcn-clos', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-025', type: 'multiple', difficulty: 'IE',
    question: '关于 Underlay 与 Overlay 的分工，以下说法正确的有？',
    options: [
      'Underlay 提供基础的 IP 互通能力',
      'Overlay（如 VXLAN）提供二层扩展与租户隔离',
      'Underlay 通常运行 OSPF、IS-IS 或 BGP',
      'Overlay 与 Underlay 必须使用完全相同的协议',
    ],
    answer: [
      'Underlay 提供基础的 IP 互通能力',
      'Overlay（如 VXLAN）提供二层扩展与租户隔离',
      'Underlay 通常运行 OSPF、IS-IS 或 BGP',
    ],
    explanation: '两层职责不同：Underlay 解决"可达"，Overlay 解决"隔离与扩展"，因此不存在"必须使用相同协议"的要求。',
    knowledgeId: 'dcn-clos', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-026', type: 'multiple', difficulty: 'IE',
    question: '关于 Clos 架构，以下说法正确的有？',
    options: [
      'Clos 是一种多级交换架构',
      'Spine-Leaf 是三级 Clos 的典型形态',
      '严格无阻塞是 Clos 的设计目标之一',
      'Clos 架构只能支持两级交换',
    ],
    answer: ['Clos 是一种多级交换架构', 'Spine-Leaf 是三级 Clos 的典型形态', '严格无阻塞是 Clos 的设计目标之一'],
    explanation: 'Clos 可扩展到更多级以支撑超大规模数据中心，并非只能两级，因此「Clos 架构只能支持两级交换」这一说法错误。',
    knowledgeId: 'dcn-clos', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-027', type: 'multiple', difficulty: 'IP',
    question: '关于 Spine 与 Leaf 的职责划分，以下说法正确的有？',
    options: [
      'Leaf 负责连接服务器与防火墙等设备',
      'Leaf 通常承担 Overlay 边缘相关职能',
      'Spine 主要承担高速转发',
      'Leaf 之间必须依靠 STP 阻塞环路',
    ],
    answer: [
      'Leaf 负责连接服务器与防火墙等设备',
      'Leaf 通常承担 Overlay 边缘相关职能',
      'Spine 主要承担高速转发',
    ],
    explanation: 'Spine-Leaf 的互联是规则的全连结构，配合 ECMP 做多路径负载分担，并不依赖 STP，因此「Leaf 之间必须依靠 STP 阻塞环路」这一说法错误。',
    knowledgeId: 'dcn-clos', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-028', type: 'judge', difficulty: 'IP',
    question: '在 Spine-Leaf 架构中，每一台 Leaf 都会与所有 Spine 相连。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '这种"全互联"保证了任意 Leaf 之间都有一条两跳路径，也天然适合配合 ECMP 实现多路径负载分担。',
    knowledgeId: 'dcn-clos', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-029', type: 'judge', difficulty: 'IE',
    question: '数据中心 Overlay 网络常采用 VXLAN 与 EVPN 实现。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'VXLAN 负责数据面封装，EVPN 负责控制面分发，二者组合是当前数据中心网络的主流方案。',
    knowledgeId: 'dcn-clos', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-030', type: 'judge', difficulty: 'IP',
    question: 'Spine-Leaf 架构主要依靠 STP 来避免环路。',
    options: ['正确', '错误'], answer: '错误',
    explanation: '该架构采用规则的全连拓扑并配合路由（如 BGP/OSPF）与 ECMP 实现无环转发，STP 并非其防环手段。',
    knowledgeId: 'dcn-clos', direction: 'dcn', tag: 'hot',
  },

  // ==================== dcn-sdn-controller  SDN 控制器与编排 ====================
  {
    id: 'ex-dcn-031', type: 'multiple', difficulty: 'IP',
    question: '关于 SDN 控制器的能力，以下说法正确的有？',
    options: [
      '负责网络自动化与策略下发',
      '华为 iMaster NCE 属于此类产品',
      '可提供网络可视化能力',
      '单机部署即可完全避免单点故障',
    ],
    answer: ['负责网络自动化与策略下发', '华为 iMaster NCE 属于此类产品', '可提供网络可视化能力'],
    explanation: '单机部署反而制造单点故障，实际工程中常通过控制器集群提升可靠性，因此「单机部署即可完全避免单点故障」这一说法错误。',
    knowledgeId: 'dcn-sdn-controller', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-032', type: 'multiple', difficulty: 'IE',
    question: '关于 SDN 的南北向接口，以下说法正确的有？',
    options: [
      '南向接口包括 OpenFlow、NETCONF、OVSDB 等',
      '北向接口通常以 RESTful API 形式提供',
      '南向接口连接控制器与转发设备',
      '北向接口连接控制器与转发设备',
    ],
    answer: [
      '南向接口包括 OpenFlow、NETCONF、OVSDB 等',
      '北向接口通常以 RESTful API 形式提供',
      '南向接口连接控制器与转发设备',
    ],
    explanation: '北向接口连接的是控制器与上层应用/编排系统，因此「北向接口连接控制器与转发设备」这一说法错误。"南向对设备、北向对应用"是必背结论。',
    knowledgeId: 'dcn-sdn-controller', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-033', type: 'multiple', difficulty: 'IE',
    question: '关于 Underlay 与 Overlay 的配合，以下说法正确的有？',
    options: [
      'Underlay 提供基础的 IP 互通',
      'Overlay 提供租户的二层/三层网络',
      'Overlay 可基于 VXLAN/EVPN 构建',
      'Overlay 与 Underlay 完全无关、互不影响',
    ],
    answer: ['Underlay 提供基础的 IP 互通', 'Overlay 提供租户的二层/三层网络', 'Overlay 可基于 VXLAN/EVPN 构建'],
    explanation: 'Overlay 的报文要依赖 Underlay 转发，其可靠性与带宽直接决定 Overlay 的表现，因此「Overlay 与 Underlay 完全无关、互不影响」这一说法错误。',
    knowledgeId: 'dcn-sdn-controller', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-034', type: 'multiple', difficulty: 'IP',
    question: '关于 SDN 控制器的高可用，以下说法正确的有？',
    options: [
      '可通过控制器集群提升整体可靠性',
      '集群部署可避免单点故障',
      '控制器故障会影响策略下发与网络编排',
      '控制器只能单机部署，无法集群',
    ],
    answer: [
      '可通过控制器集群提升整体可靠性',
      '集群部署可避免单点故障',
      '控制器故障会影响策略下发与网络编排',
    ],
    explanation: '主流 SDN 方案均支持控制器集群部署，因此"只能单机"错误。',
    knowledgeId: 'dcn-sdn-controller', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-035', type: 'judge', difficulty: 'IE',
    question: 'SDN 的南向接口用于连接控制器与转发设备。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '南向（对设备）常用 OpenFlow、NETCONF、OVSDB；北向（对应用）多为 RESTful API，方向不可记反。',
    knowledgeId: 'dcn-sdn-controller', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-036', type: 'judge', difficulty: 'IE',
    question: 'SDN 的北向接口通常以 RESTful API 的形式对外提供。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '北向接口面向业务编排与上层应用，采用 RESTful 风格便于应用快速集成与二次开发。',
    knowledgeId: 'dcn-sdn-controller', direction: 'dcn', tag: 'hot',
  },
  {
    id: 'ex-dcn-037', type: 'judge', difficulty: 'IP',
    question: 'SDN 控制器采用单机部署即可满足所有可靠性要求。',
    options: ['正确', '错误'], answer: '错误',
    explanation: '控制器是全网策略的核心，其故障影响面极大，因此生产环境普遍采用集群部署来消除单点故障。',
    knowledgeId: 'dcn-sdn-controller', direction: 'dcn', tag: 'hot',
  },
]
