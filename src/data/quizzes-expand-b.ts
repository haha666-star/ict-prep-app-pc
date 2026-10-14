/**
 * 题库扩容（第二批）：数通 · 路由协议与访问控制类考点
 *
 * 目标：每个考点 单选>=3 / 多选>=4 / 判断>=4；对 OSPF、BGP、IS-IS 等
 * 省赛权重高的核心协议额外加码。
 * 标签口径见 quizzes-expand-a.ts 顶部的说明（real=真题同源考法，非原题收录）。
 */
import type { IQuizQuestion } from './quizzes'

export const EXTRA_QUIZZES_EXPAND_B: IQuizQuestion[] = [
  // ==================== datacom-static-route  静态路由 ====================
  {
    id: 'ex-dc-053', type: 'multiple', difficulty: 'IA',
    question: '关于静态路由的特点，以下说法正确的有？',
    options: [
      '由管理员手工配置，配置简单、可控性强',
      '不会随网络拓扑变化自动调整',
      '默认路由的目标网络为 0.0.0.0/0',
      '静态路由的优先级可以手工调整',
    ],
    answer: [
      '由管理员手工配置，配置简单、可控性强',
      '不会随网络拓扑变化自动调整',
      '默认路由的目标网络为 0.0.0.0/0',
      '静态路由的优先级可以手工调整',
    ],
    explanation: '四项均正确。正是"不自动调整"这一特性，使静态路由适合做小网络主路由或大网络的备份路由（浮动静态路由）。',
    knowledgeId: 'datacom-static-route', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-054', type: 'multiple', difficulty: 'IA',
    question: '关于华为设备各类路由的默认优先级，以下说法正确的有？',
    options: ['直连路由默认为 0', '静态路由默认为 60', 'OSPF 默认为 10', '优先级数值越大越优先'],
    answer: ['直连路由默认为 0', '静态路由默认为 60', 'OSPF 默认为 10'],
    explanation: '路由优先级数值越小越优先，因此直连路由最优先被选中，「优先级数值越大越优先」这一说法与事实相反。',
    knowledgeId: 'datacom-static-route', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-055', type: 'multiple', difficulty: 'IP',
    question: '关于浮动静态路由，以下说法正确的有？',
    options: [
      '通过配置不同的优先级实现主备关系',
      '主路由有效时，备用路由不会出现在当前路由表中',
      '主路由失效后，备用路由自动生效',
      '主备两条路由必须指向同一个下一跳才有意义',
    ],
    answer: [
      '通过配置不同的优先级实现主备关系',
      '主路由有效时，备用路由不会出现在当前路由表中',
      '主路由失效后，备用路由自动生效',
    ],
    explanation: '主备两条路由必须指向不同的下一跳或出接口，否则不具备备份意义，因此「主备两条路由必须指向同一个下一跳才有意义」这一说法错误。',
    knowledgeId: 'datacom-static-route', direction: 'datacom', tag: 'real',
  },
  {
    id: 'ex-dc-056', type: 'multiple', difficulty: 'IP',
    question: '关于静态路由的配置方式，以下说法正确的有？',
    options: [
      '在点到点链路上可以只指定出接口',
      '在广播型网络上通常需要指定下一跳地址',
      '下一跳非直连时，静态路由可以迭代查找到最终下一跳',
      '静态路由无法与动态路由协议共存于同一台设备',
    ],
    answer: [
      '在点到点链路上可以只指定出接口',
      '在广播型网络上通常需要指定下一跳地址',
      '下一跳非直连时，静态路由可以迭代查找到最终下一跳',
    ],
    explanation: '静态路由与动态路由可以共存，实际网络中常用静态路由做备份或补充，因此「静态路由无法与动态路由协议共存于同一台设备」这一说法错误。',
    knowledgeId: 'datacom-static-route', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-057', type: 'judge', difficulty: 'IA',
    question: '静态路由的优点是简单高效，缺点是无法感知网络拓扑变化。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '静态路由不会随拓扑变化自动收敛，链路故障时需要管理员介入或依靠 BFD/NQA 联动才能快速感知。',
    knowledgeId: 'datacom-static-route', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-058', type: 'judge', difficulty: 'IP',
    question: '默认路由 0.0.0.0/0 的匹配优先级低于具体明细路由。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '路由查找遵循最长前缀匹配原则，明细路由（前缀更长）优先于默认路由，只有在无其他匹配时才使用默认路由。',
    knowledgeId: 'datacom-static-route', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-059', type: 'judge', difficulty: 'IA',
    question: '静态路由只能用于小型网络，大型网络完全不能使用。',
    options: ['正确', '错误'], answer: '错误',
    explanation: '该说法过于绝对。大型网络中静态路由常用于出口默认路由、特定业务引流以及浮动备份，与动态路由配合使用。',
    knowledgeId: 'datacom-static-route', direction: 'datacom', tag: 'hot',
  },

  // ==================== datacom-isis  IS-IS ====================
  {
    id: 'ex-dc-060', type: 'multiple', difficulty: 'IP',
    question: '关于 IS-IS 的路由器类型，以下说法正确的有？',
    options: [
      'Level-1 路由器只维护本区域内的链路状态',
      'Level-2 路由器负责区域间路由，构成骨干层',
      'Level-1-2 路由器同时参与 Level-1 与 Level-2',
      'Level-1 路由器可以直接与区域外的 Level-2 路由器建立邻居',
    ],
    answer: [
      'Level-1 路由器只维护本区域内的链路状态',
      'Level-2 路由器负责区域间路由，构成骨干层',
      'Level-1-2 路由器同时参与 Level-1 与 Level-2',
    ],
    explanation: 'Level-1 路由器只能与同区域的 Level-1 或 Level-1-2 建立邻居，跨区域必须经 Level-1-2 转发，因此「Level-1 路由器可以直接与区域外的 Level-2 路由器建立邻居」这一说法错误。',
    knowledgeId: 'datacom-isis', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-061', type: 'multiple', difficulty: 'IP',
    question: '关于 IS-IS 的 DIS，以下说法正确的有？',
    options: [
      'DIS 在广播网络上选举产生，作用类似 OSPF 的 DR',
      'DIS 优先级默认为 64',
      'DIS 支持抢占，优先级更高的设备加入后会重新选举',
      'IS-IS 与 OSPF 一样，同时存在 DIS 与 BDR',
    ],
    answer: [
      'DIS 在广播网络上选举产生，作用类似 OSPF 的 DR',
      'DIS 优先级默认为 64',
      'DIS 支持抢占，优先级更高的设备加入后会重新选举',
    ],
    explanation: 'IS-IS 只有 DIS，没有 BDR，且优先级为 0 的设备也参与选举，因此「IS-IS 与 OSPF 一样，同时存在 DIS 与 BDR」这一说法错误。这是与 OSPF 的关键区别。',
    knowledgeId: 'datacom-isis', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-062', type: 'multiple', difficulty: 'IP',
    question: '关于 IS-IS 的 NET 地址，以下说法正确的有？',
    options: [
      'NET 由 Area ID、System ID、NSEL 三部分组成',
      'System ID 长度固定为 6 字节',
      '路由器的 NET 中 NSEL 必须为 00',
      '同一个 Level-1 区域内的 Area ID 可以互不相同',
    ],
    answer: [
      'NET 由 Area ID、System ID、NSEL 三部分组成',
      'System ID 长度固定为 6 字节',
      '路由器的 NET 中 NSEL 必须为 00',
    ],
    explanation: '同一 Level-1 区域内所有路由器的 Area ID 必须相同，否则无法形成同一区域，因此「同一个 Level-1 区域内的 Area ID 可以互不相同」这一说法错误。',
    knowledgeId: 'datacom-isis', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-063', type: 'multiple', difficulty: 'IE',
    question: '关于 IS-IS 的度量与报文，以下说法正确的有？',
    options: [
      'IS-IS 默认使用窄度量，最大值为 63',
      '宽度量支持 32 位，可适应大规模网络',
      'IIH 报文用于发现和维持邻居关系',
      'CSNP 用于描述链路状态数据库的完整摘要',
    ],
    answer: [
      'IS-IS 默认使用窄度量，最大值为 63',
      '宽度量支持 32 位，可适应大规模网络',
      'IIH 报文用于发现和维持邻居关系',
      'CSNP 用于描述链路状态数据库的完整摘要',
    ],
    explanation: '四项均正确。此外 PSNP 用于请求和确认缺失的 LSP，LSP 则承载链路状态信息本身。',
    knowledgeId: 'datacom-isis', direction: 'datacom', tag: 'hot',
  },

  // ==================== datacom-bgp  BGP（核心考点，额外加码）====================
  {
    id: 'ex-dc-064', type: 'multiple', difficulty: 'IP',
    question: '关于 BGP 路由属性的分类，以下说法正确的有？',
    options: [
      'Origin、AS_Path、Next_Hop 属于公认必遵属性',
      'Local_Pref 属于公认自由决定属性',
      'Community 属于可选过渡属性',
      'MED 属于可选过渡属性',
    ],
    answer: [
      'Origin、AS_Path、Next_Hop 属于公认必遵属性',
      'Local_Pref 属于公认自由决定属性',
      'Community 属于可选过渡属性',
    ],
    explanation: 'MED 属于可选**非过渡**属性，默认不跨 AS 传递；把 MED 与 Community 的属性类别混淆是高频失分点。',
    knowledgeId: 'datacom-bgp', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-065', type: 'multiple', difficulty: 'IE',
    question: '关于 BGP 的路由优选顺序，以下说法正确的有？',
    options: [
      '优先比较 Weight，数值大者优先',
      'Weight 相同时比较 Local_Pref，数值大者优先',
      'Local_Pref 相同时比较 AS_Path，长度短者优先',
      '在优选顺序中，MED 的比较优先于 Local_Pref',
    ],
    answer: [
      '优先比较 Weight，数值大者优先',
      'Weight 相同时比较 Local_Pref，数值大者优先',
      'Local_Pref 相同时比较 AS_Path，长度短者优先',
    ],
    explanation: '优选顺序中华为私有的 Weight 最先比较，其次是 Local_Pref，再往后才是 AS_Path、Origin、MED，因此 MED 不可能优先于 Local_Pref。',
    knowledgeId: 'datacom-bgp', direction: 'datacom', tag: 'real',
  },
  {
    id: 'ex-dc-066', type: 'judge', difficulty: 'IA',
    question: 'BGP 使用 TCP 179 端口建立邻居关系。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'BGP 是基于 TCP 的路径矢量协议，固定使用 179 端口；由于依赖 TCP，邻居之间不需要直连（可通过多跳建立）。',
    knowledgeId: 'datacom-bgp', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-067', type: 'judge', difficulty: 'IP',
    question: 'IBGP 邻居之间传递路由时，默认不会改变 Next_Hop 属性。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'IBGP 默认不修改下一跳，因此常需要在边界设备上配置 next-hop-local，否则内部邻居可能因下一跳不可达而无法使用该路由。',
    knowledgeId: 'datacom-bgp', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-068', type: 'judge', difficulty: 'IP',
    question: 'IBGP 水平分割规则要求：从 IBGP 邻居学到的路由不再通告给其他 IBGP 邻居。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '该规则用于防止 AS 内部路由环路，但副作用是要求 IBGP 全互联，因此引入路由反射器或联盟来简化。',
    knowledgeId: 'datacom-bgp', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-069', type: 'judge', difficulty: 'IP',
    question: '路由反射器（RR）用于解决 IBGP 全互联带来的扩展性问题。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'RR 将从一个客户端学到的路由反射给其他客户端与非客户端，从而避免要求所有 IBGP 邻居两两建立会话。',
    knowledgeId: 'datacom-bgp', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-070', type: 'judge', difficulty: 'IP',
    question: 'EBGP 邻居之间发送的报文默认 TTL 为 255，因此可以跨多个 AS 建立邻居。',
    options: ['正确', '错误'], answer: '错误',
    explanation: 'EBGP 报文默认 TTL 为 1，通常要求直连；若需多跳建立 EBGP 邻居，必须显式配置 ebgp-max-hop。TTL 为 255 的说法与默认值不符。',
    knowledgeId: 'datacom-bgp', direction: 'datacom', tag: 'hot',
  },

  // ==================== datacom-route-policy  路由策略 ====================
  {
    id: 'ex-dc-071', type: 'multiple', difficulty: 'IP',
    question: '关于 Filter-Policy，以下说法正确的有？',
    options: [
      '可基于 ACL 或 IP 前缀列表过滤路由',
      '可在 import 方向生效',
      '可在 export 方向生效',
      '只能用于过滤 OSPF 路由',
    ],
    answer: [
      '可基于 ACL 或 IP 前缀列表过滤路由',
      '可在 import 方向生效',
      '可在 export 方向生效',
    ],
    explanation: 'Filter-Policy 是通用路由过滤工具，可用于 OSPF、IS-IS、BGP 等多种协议，因此「只能用于过滤 OSPF 路由」这一说法错误。',
    knowledgeId: 'datacom-route-policy', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-072', type: 'multiple', difficulty: 'IP',
    question: '关于 Route-Policy，以下说法正确的有？',
    options: [
      '由多个节点（node）组成，按节点序号从小到大依次匹配',
      '同一节点内多条 if-match 之间是"与"的关系',
      'apply 用于修改匹配到的路由属性',
      '某个节点匹配成功后，仍会继续匹配后续所有节点',
    ],
    answer: [
      '由多个节点（node）组成，按节点序号从小到大依次匹配',
      '同一节点内多条 if-match 之间是"与"的关系',
      'apply 用于修改匹配到的路由属性',
    ],
    explanation: '一旦节点匹配成功即执行其动作并退出匹配过程，不再继续匹配后续节点，因此「某个节点匹配成功后，仍会继续匹配后续所有节点」这一说法错误。',
    knowledgeId: 'datacom-route-policy', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-073', type: 'multiple', difficulty: 'IE',
    question: '关于路由引入（Import/Redistribute），以下说法正确的有？',
    options: [
      '可将其他协议的路由发布到本协议中',
      '双点双向引入可能产生环路与次优路径',
      '引入时通常需要指定度量值等参数',
      '引入后的路由优先级与原协议保持一致',
    ],
    answer: [
      '可将其他协议的路由发布到本协议中',
      '双点双向引入可能产生环路与次优路径',
      '引入时通常需要指定度量值等参数',
    ],
    explanation: '引入后路由会按本协议的外部优先级参与选路（如 OSPF 外部路由与内部路由优先级不同），因此「引入后的路由优先级与原协议保持一致」这一说法错误。',
    knowledgeId: 'datacom-route-policy', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-074', type: 'judge', difficulty: 'IP',
    question: 'IP-Prefix 前缀列表比 ACL 更精确，可以匹配掩码长度范围。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '前缀列表可同时限定网络前缀与掩码长度范围（如 ip ip-prefix 允许前缀长度 24~28），这是 ACL 难以表达的。',
    knowledgeId: 'datacom-route-policy', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-075', type: 'judge', difficulty: 'IP',
    question: 'Route-Policy 中节点序号越小，匹配优先级越高。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '节点按序号从小到大依次匹配，序号小的先被检查；若该节点匹配成功则立即执行动作并结束。',
    knowledgeId: 'datacom-route-policy', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-076', type: 'judge', difficulty: 'IP',
    question: '路由策略（route-policy）与策略路由（PBR）是同一个概念。',
    options: ['正确', '错误'], answer: '错误',
    explanation: '两者作用对象不同：路由策略过滤或修改**路由**，影响路由表；策略路由控制**报文转发**，可绕过路由表。这是高频易混点。',
    knowledgeId: 'datacom-route-policy', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-077', type: 'judge', difficulty: 'IP',
    question: 'AS-Path-Filter 使用正则表达式匹配 BGP 路由的 AS 路径。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'AS-Path-Filter 通过正则表达式匹配 AS_Path 属性，是 BGP 入/出方向过滤的常用手段。',
    knowledgeId: 'datacom-route-policy', direction: 'datacom', tag: 'hot',
  },

  // ==================== datacom-ipv6-basic  IPv6基础 ====================
  {
    id: 'ex-dc-078', type: 'multiple', difficulty: 'IA',
    question: '关于 IPv6 地址，以下说法正确的有？',
    options: [
      'IPv6 地址长度为 128 位',
      '连续的全零组可用 :: 压缩，且在一个地址中只允许出现一次',
      'IPv6 取消了广播地址，使用组播替代其功能',
      '链路本地地址的前缀为 FE80::/10',
    ],
    answer: [
      'IPv6 地址长度为 128 位',
      '连续的全零组可用 :: 压缩，且在一个地址中只允许出现一次',
      'IPv6 取消了广播地址，使用组播替代其功能',
      '链路本地地址的前缀为 FE80::/10',
    ],
    explanation: '四项均正确。:: 只能出现一次，否则地址长度无法唯一还原，是 IPv6 书写的硬性规则。',
    knowledgeId: 'datacom-ipv6-basic', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-079', type: 'judge', difficulty: 'IA',
    question: 'IPv6 使用邻居发现协议（NDP）取代了 IPv4 中的 ARP。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'NDP 通过 NS/NA 等 ICMPv6 报文完成地址解析、重复地址检测、路由器发现等功能，等价并扩展了 ARP 的作用。',
    knowledgeId: 'datacom-ipv6-basic', direction: 'datacom', tag: 'hot',
  },

  // ==================== datacom-ospfv3  OSPFv3 ====================
  {
    id: 'ex-dc-080', type: 'multiple', difficulty: 'IE',
    question: '关于 OSPFv3 与 OSPFv2 的区别，以下说法正确的有？',
    options: [
      'OSPFv3 基于链路运行，而非基于子网',
      'OSPFv3 使用链路本地地址作为邻居间通信的源地址',
      'OSPFv3 新增 Link LSA 与 Intra-Area-Prefix LSA',
      'OSPFv3 的 Router ID 仍然是 32 位',
    ],
    answer: [
      'OSPFv3 基于链路运行，而非基于子网',
      'OSPFv3 使用链路本地地址作为邻居间通信的源地址',
      'OSPFv3 新增 Link LSA 与 Intra-Area-Prefix LSA',
      'OSPFv3 的 Router ID 仍然是 32 位',
    ],
    explanation: '四项均正确。Router ID 沿用 32 位格式（通常从 IPv4 地址或手工指定），这是与邻居建立的重要前提。',
    knowledgeId: 'datacom-ospfv3', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-081', type: 'multiple', difficulty: 'IE',
    question: '关于 OSPFv3 的特性，以下说法正确的有？',
    options: [
      '支持在同一条链路上运行多个实例',
      '认证依赖 IPv6 的 AH/ESP，而非报文自带的认证字段',
      'Router ID 需手工配置或从 IPv4 地址获取',
      'OSPFv3 与 OSPFv2 无法在同一台设备上共存',
    ],
    answer: [
      '支持在同一条链路上运行多个实例',
      '认证依赖 IPv6 的 AH/ESP，而非报文自带的认证字段',
      'Router ID 需手工配置或从 IPv4 地址获取',
    ],
    explanation: 'OSPFv3 与 OSPFv2 是两个独立的进程，可以在同一台设备上同时运行、互不影响，因此「OSPFv3 与 OSPFv2 无法在同一台设备上共存」这一说法错误。',
    knowledgeId: 'datacom-ospfv3', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-082', type: 'judge', difficulty: 'IE',
    question: 'OSPFv3 的 Router ID 仍然是 32 位，不能直接使用 IPv6 地址充当。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'OSPFv3 沿用 IPv4 时代的 32 位 Router ID 格式，因此配置时需手工指定或借用设备上已有的 IPv4 地址。',
    knowledgeId: 'datacom-ospfv3', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-083', type: 'judge', difficulty: 'IE',
    question: 'OSPFv3 将地址信息从 Router LSA 中分离出来，改由 Intra-Area-Prefix LSA 承载。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '这一改动使 OSPFv3 的拓扑描述与地址信息解耦，从而支持在同一链路上运行多个实例。',
    knowledgeId: 'datacom-ospfv3', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-084', type: 'judge', difficulty: 'IE',
    question: 'OSPFv3 的邻居建立、DR 选举与区域划分机制与 OSPFv2 完全不同。',
    options: ['正确', '错误'], answer: '错误',
    explanation: '这些机制在 OSPFv3 中与 OSPFv2 基本一致，主要差异在于基于链路运行、使用链路本地地址、LSA 类型调整与认证方式变化。',
    knowledgeId: 'datacom-ospfv3', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-085', type: 'judge', difficulty: 'IE',
    question: 'OSPFv3 支持在同一条链路上运行多个实例（Instance ID）。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '实例机制使不同实例的邻居互不干扰，可用于在同一物理链路上承载不同业务或 VPN。',
    knowledgeId: 'datacom-ospfv3', direction: 'datacom', tag: 'hot',
  },

  // ==================== datacom-bgp4plus  BGP4+ ====================
  {
    id: 'ex-dc-086', type: 'multiple', difficulty: 'IE',
    question: '关于 BGP4+，以下说法正确的有？',
    options: [
      'BGP4+ 是 BGP-4 的多协议扩展，支持承载 IPv6 路由',
      '通过 MP_REACH_NLRI 属性携带 IPv6 可达路由',
      '通过 MP_UNREACH_NLRI 属性撤销 IPv6 路由',
      'BGP4+ 只能使用 IPv6 地址建立邻居',
    ],
    answer: [
      'BGP4+ 是 BGP-4 的多协议扩展，支持承载 IPv6 路由',
      '通过 MP_REACH_NLRI 属性携带 IPv6 可达路由',
      '通过 MP_UNREACH_NLRI 属性撤销 IPv6 路由',
    ],
    explanation: 'BGP4+ 的邻居可以基于 IPv4 地址建立，同时传递 IPv6 路由（即通常所说的"4 建 6 传"），因此「BGP4+ 只能使用 IPv6 地址建立邻居」这一说法错误。',
    knowledgeId: 'datacom-bgp4plus', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-087', type: 'judge', difficulty: 'IE',
    question: 'BGP4+ 的邻居可以基于 IPv4 地址建立，同时传递 IPv6 路由。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '这是 BGP4+ 的常见部署方式：利用现成的 IPv4 邻居承载 IPv6 地址族路由，减少改造工作量。',
    knowledgeId: 'datacom-bgp4plus', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-088', type: 'judge', difficulty: 'IE',
    question: 'BGP4+ 支持 6PE 与 6VPE 等演进场景。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '6PE 实现 IPv6 孤岛经 MPLS 骨干互通，6VPE 则在此基础上提供 IPv6 的 VPN 隔离能力。',
    knowledgeId: 'datacom-bgp4plus', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-089', type: 'judge', difficulty: 'IE',
    question: 'BGP4+ 的路由优选规则与 BGP-4 完全不同。',
    options: ['正确', '错误'], answer: '错误',
    explanation: '两者的优选规则基本一致，差异主要在于需要区分地址族（IPv4/IPv6）进行策略与路由处理。',
    knowledgeId: 'datacom-bgp4plus', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-090', type: 'judge', difficulty: 'IE',
    question: '配置 BGP4+ 时，需要在 IPv6 地址族视图下激活邻居并配置相关策略。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '多协议扩展的配置模型要求进入对应地址族视图，否则邻居虽建立但 IPv6 路由不会交互。',
    knowledgeId: 'datacom-bgp4plus', direction: 'datacom', tag: 'hot',
  },

  // ==================== datacom-acl  ACL访问控制列表 ====================
  {
    id: 'ex-dc-091', type: 'multiple', difficulty: 'IA',
    question: '关于 ACL 的分类与编号，以下说法正确的有？',
    options: ['基本 ACL 的编号范围为 2000~2999', '高级 ACL 的编号范围为 3000~3999', '二层 ACL 的编号范围为 4000~4999', '基本 ACL 只能匹配源 IP 地址'],
    answer: ['基本 ACL 的编号范围为 2000~2999', '高级 ACL 的编号范围为 3000~3999', '二层 ACL 的编号范围为 4000~4999', '基本 ACL 只能匹配源 IP 地址'],
    explanation: '四项均正确。基本 ACL 能力有限（仅源 IP），复杂匹配需使用高级 ACL，这是选型时的第一步判断。',
    knowledgeId: 'datacom-acl', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-092', type: 'multiple', difficulty: 'IP',
    question: '关于 ACL 的匹配规则，以下说法正确的有？',
    options: [
      '默认按配置顺序（rule ID 从小到大）匹配',
      '匹配到第一条命中的规则后立即执行动作，不再继续匹配',
      'ACL 末尾隐含一条拒绝所有的规则',
      '通配符掩码中，1 表示该位必须匹配',
    ],
    answer: [
      '默认按配置顺序（rule ID 从小到大）匹配',
      '匹配到第一条命中的规则后立即执行动作，不再继续匹配',
      'ACL 末尾隐含一条拒绝所有的规则',
    ],
    explanation: '通配符掩码与子网掩码相反：0 表示必须匹配，1 表示忽略，因此「通配符掩码中，1 表示该位必须匹配」这一说法错误。',
    knowledgeId: 'datacom-acl', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-093', type: 'multiple', difficulty: 'IP',
    question: 'ACL 可以应用于以下哪些场景？',
    options: ['接口流量过滤', '路由过滤', 'NAT 地址转换的匹配条件', 'QoS 流分类'],
    answer: ['接口流量过滤', '路由过滤', 'NAT 地址转换的匹配条件', 'QoS 流分类'],
    explanation: '四项均正确。ACL 是通用的匹配工具，不局限于接口过滤，考试中常与 NAT、路由策略、QoS 组合出现。',
    knowledgeId: 'datacom-acl', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-094', type: 'judge', difficulty: 'IP',
    question: '高级 ACL 可以匹配源/目的 IP 地址、协议号以及端口号。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '高级 ACL 支持五元组级别的匹配，能够精确控制特定协议与端口的流量，因此实际网络中使用最广。',
    knowledgeId: 'datacom-acl', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-095', type: 'judge', difficulty: 'IA',
    question: 'ACL 通配符掩码中，0 表示必须匹配，1 表示忽略该位。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '这与子网掩码"1 匹配、0 忽略"恰好相反，是 ACL 配置中最经典的易错点。',
    knowledgeId: 'datacom-acl', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-096', type: 'judge', difficulty: 'IA',
    question: 'ACL 中未被任何规则命中的数据包会被默认允许通过。',
    options: ['正确', '错误'], answer: '错误',
    explanation: 'ACL 末尾存在隐含的"拒绝所有"规则，未被命中的报文默认被丢弃，配置时必须在末尾显式放行必要流量。',
    knowledgeId: 'datacom-acl', direction: 'datacom', tag: 'hot',
  },
]
