/**
 * 题库扩容（第一批）：数通 · 网络基础类考点
 *
 * 背景：2026-10-13 扩容前实测——题库 964 题里单选 697（72%），而官方省赛是「判断+单选+多选」
 * 三题型均考。多选/判断严重不足，且大量考点存在「某题型为 0」的空壳。
 * 本批按 knowledge.ts 的考点逐条补齐，目标：每个考点 单选>=3 / 多选>=4 / 判断>=4。
 * （扩容后全库 1351 题：单选 710 / 多选 319 / 判断 322；68 个可挂题考点全部达标
 *   —— 实测：node ict-audit-v2/verify-expand.mjs）
 *
 * 标签口径（务必先读）：
 *   tag:'hot'  = 高频考点（对应 official 考纲内的知识点，按考点权重判断）
 *   tag:'real' = 真题同源考法（题干贴近华为 ICT 大赛的「情境/排障」出题形式），
 *                **不是历年原题收录**，切勿当作原题使用
 *
 * 出题纪律：
 *   1) answer 存**选项文本**，不是下标（stableShuffleOptions 会打乱选项）
 *   2) 解析中**不引用「选项A/B/C/D」**，否则该题会被判定为顺序敏感而跳过打乱
 *   3) 判断题 options 恒为 ['正确','错误']
 */
import type { IQuizQuestion } from './quizzes'

export const EXTRA_QUIZZES_EXPAND_A: IQuizQuestion[] = [
  // ==================== datacom-osi-tcpip  OSI与TCP/IP模型 ====================
  {
    id: 'ex-dc-001', type: 'single', difficulty: 'IA',
    question: '在 OSI 参考模型中，数据链路层的数据协议单元（PDU）名称是？',
    options: ['比特（Bit）', '帧（Frame）', '包（Packet）', '段（Segment）'],
    answer: '帧（Frame）',
    explanation: '各层 PDU 名称自下而上为：物理层比特、数据链路层帧、网络层包、传输层段。这是识记类必考点，常与"协议所在层次"组合出题。',
    knowledgeId: 'datacom-osi-tcpip', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-002', type: 'multiple', difficulty: 'IA',
    question: '关于 OSI 七层模型与 TCP/IP 四层模型的对应关系，以下描述正确的有？',
    options: [
      'OSI 的会话层、表示层、应用层在 TCP/IP 模型中合并为应用层',
      'OSI 的物理层与数据链路层在 TCP/IP 模型中合并为网络接口层',
      'TCP/IP 的网际层对应 OSI 的网络层',
      'OSI 的传输层在 TCP/IP 模型中没有对应层次',
    ],
    answer: [
      'OSI 的会话层、表示层、应用层在 TCP/IP 模型中合并为应用层',
      'OSI 的物理层与数据链路层在 TCP/IP 模型中合并为网络接口层',
      'TCP/IP 的网际层对应 OSI 的网络层',
    ],
    explanation: 'TCP/IP 四层自上而下为应用层、传输层、网际层、网络接口层。其传输层与 OSI 传输层一一对应，并非没有对应层次，因此第四项错误。',
    knowledgeId: 'datacom-osi-tcpip', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-003', type: 'multiple', difficulty: 'IP',
    question: '以下协议与其所在 OSI 层次的对应关系，正确的有？',
    options: ['ICMP 工作在网络层', 'ARP 工作在网络层', 'TCP 工作在传输层', 'DNS 工作在传输层'],
    answer: ['ICMP 工作在网络层', 'ARP 工作在网络层', 'TCP 工作在传输层'],
    explanation: 'DNS 是应用层协议（使用 UDP/TCP 53 端口）；ICMP 与 ARP 均属网络层协议，TCP 属传输层协议。',
    knowledgeId: 'datacom-osi-tcpip', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-004', type: 'multiple', difficulty: 'IA',
    question: '关于数据封装与解封装，以下说法正确的有？',
    options: [
      '发送方自上而下逐层封装，每层添加本层首部',
      '接收方自下而上逐层解封装，逐层剥离首部',
      '最终在物理层以比特流形式在介质上传输',
      '封装过程中数据报文的总体长度保持不变',
    ],
    answer: [
      '发送方自上而下逐层封装，每层添加本层首部',
      '接收方自下而上逐层解封装，逐层剥离首部',
      '最终在物理层以比特流形式在介质上传输',
    ],
    explanation: '每层封装都会增加首部（以太网帧还会追加 FCS 尾部），报文总体长度必然增大，不会保持不变。',
    knowledgeId: 'datacom-osi-tcpip', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-005', type: 'judge', difficulty: 'IA',
    question: 'OSI 参考模型的传输层负责为应用进程提供端到端的传输服务。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '传输层提供端到端（进程到进程）的传输；网络层提供点到点（主机到主机）的传输，二者层次不同。',
    knowledgeId: 'datacom-osi-tcpip', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-006', type: 'judge', difficulty: 'IA',
    question: '在 TCP/IP 模型中，网络接口层同时涵盖 OSI 物理层与数据链路层的功能。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'TCP/IP 的网络接口层对应 OSI 物理层与数据链路层的合并，负责物理介质访问与帧的收发。',
    knowledgeId: 'datacom-osi-tcpip', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-007', type: 'judge', difficulty: 'IA',
    question: 'OSI 七层模型中，交换机与路由器都工作在网络层。',
    options: ['正确', '错误'], answer: '错误',
    explanation: '交换机工作在数据链路层（依据 MAC 地址转发），路由器工作在网络层（依据 IP 地址转发），只有三层交换机才具备网络层转发能力。',
    knowledgeId: 'datacom-osi-tcpip', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-008', type: 'judge', difficulty: 'IP',
    question: '解封装与封装的方向相同，都是自上而下逐层处理。',
    options: ['正确', '错误'], answer: '错误',
    explanation: '封装自上而下（应用层→物理层），解封装自下而上（物理层→应用层），两者方向相反。',
    knowledgeId: 'datacom-osi-tcpip', direction: 'datacom', tag: 'hot',
  },

  // ==================== datacom-ip-subnet  IP地址与子网划分 ====================
  {
    id: 'ex-dc-009', type: 'multiple', difficulty: 'IA',
    question: '关于私有 IP 地址范围，以下说法正确的有？',
    options: [
      '10.0.0.0/8 属于 A 类私有地址',
      '172.16.0.0/12 属于 B 类私有地址',
      '192.168.0.0/16 属于 C 类私有地址',
      '100.64.0.0/10 属于 RFC 1918 定义的私有地址',
    ],
    answer: [
      '10.0.0.0/8 属于 A 类私有地址',
      '172.16.0.0/12 属于 B 类私有地址',
      '192.168.0.0/16 属于 C 类私有地址',
    ],
    explanation: 'RFC 1918 只定义上述三段私有地址。100.64.0.0/10 是 RFC 6598 为运营商级 NAT（CGN）保留的共享地址空间，不属于私有地址。',
    knowledgeId: 'datacom-ip-subnet', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-010', type: 'multiple', difficulty: 'IP',
    question: '某主机地址为 192.168.10.130/26，以下说法正确的有？',
    options: [
      '该子网网络地址为 192.168.10.128',
      '该子网广播地址为 192.168.10.191',
      '该子网可用主机地址数为 62',
      '该子网掩码为 255.255.255.192',
    ],
    answer: [
      '该子网网络地址为 192.168.10.128',
      '该子网广播地址为 192.168.10.191',
      '该子网可用主机地址数为 62',
      '该子网掩码为 255.255.255.192',
    ],
    explanation: '/26 对应掩码 255.255.255.192，块大小为 64。第四个八位组 130 落在 128~191 网段：网络地址 128、广播地址 191，可用主机数 2^6-2=62。四项均正确。',
    knowledgeId: 'datacom-ip-subnet', direction: 'datacom', tag: 'real',
  },
  {
    id: 'ex-dc-011', type: 'multiple', difficulty: 'IP',
    question: '关于 VLSM 与 CIDR，以下说法正确的有？',
    options: [
      'VLSM 允许在同一网络中使用不同长度的子网掩码',
      'CIDR 支持路由聚合，可减小路由表规模',
      'VLSM 的使用前提是路由协议能够传递掩码信息',
      'RIPv1 等有类路由协议可以支持 VLSM',
    ],
    answer: [
      'VLSM 允许在同一网络中使用不同长度的子网掩码',
      'CIDR 支持路由聚合，可减小路由表规模',
      'VLSM 的使用前提是路由协议能够传递掩码信息',
    ],
    explanation: 'RIPv1 属于有类路由协议，路由更新中不携带掩码，因此不支持 VLSM；RIPv2、OSPF 等无类协议才支持。',
    knowledgeId: 'datacom-ip-subnet', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-012', type: 'judge', difficulty: 'IA',
    question: '/30 子网常用于点到点链路，可提供 2 个可用主机地址。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '/30 只有 2 位主机位，去掉网络地址与广播地址后恰好剩 2 个可用地址，非常适合路由器之间的互联链路。',
    knowledgeId: 'datacom-ip-subnet', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-013', type: 'judge', difficulty: 'IA',
    question: '广播地址的网络位与网络地址相同，主机位全部为 0。',
    options: ['正确', '错误'], answer: '错误',
    explanation: '广播地址的主机位全部为 1；主机位全 0 的是网络地址。两者恰好相反，是常见易错点。',
    knowledgeId: 'datacom-ip-subnet', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-014', type: 'judge', difficulty: 'IP',
    question: '192.168.1.0/25 与 192.168.1.128/25 可以聚合为 192.168.1.0/24。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '两个 /25 正好拼成一个完整的 /24 网段，前缀长度减 1 后即为聚合路由 192.168.1.0/24。',
    knowledgeId: 'datacom-ip-subnet', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-015', type: 'judge', difficulty: 'IA',
    question: 'A 类地址的第一个八位组范围为 1~126，127 被保留用于环回测试。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'A 类地址首位为 0，第一个八位组取值 1~126；127.0.0.0/8 被保留作环回地址（如 127.0.0.1），不分配给主机。',
    knowledgeId: 'datacom-ip-subnet', direction: 'datacom', tag: 'hot',
  },

  // ==================== datacom-arp  ARP协议 ====================
  {
    id: 'ex-dc-016', type: 'single', difficulty: 'IA',
    question: 'ARP 请求报文在以太网中的目的 MAC 地址是？',
    options: ['单播 MAC 地址', '广播 MAC 地址（FF-FF-FF-FF-FF-FF）', '组播 MAC 地址', '发送方自身的 MAC 地址'],
    answer: '广播 MAC 地址（FF-FF-FF-FF-FF-FF）',
    explanation: 'ARP 请求以广播形式发出，请求"谁拥有该 IP"，目的 MAC 为全 F；收到请求的目标主机以单播方式应答。',
    knowledgeId: 'datacom-arp', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-017', type: 'multiple', difficulty: 'IA',
    question: '关于 ARP 的工作机制，以下说法正确的有？',
    options: [
      'ARP 请求为广播，ARP 应答为单播',
      'ARP 缓存表项有老化时间，超时后需重新解析',
      '免费 ARP 可用于检测 IP 地址冲突',
      'ARP 应答报文以广播方式发送',
    ],
    answer: [
      'ARP 请求为广播，ARP 应答为单播',
      'ARP 缓存表项有老化时间，超时后需重新解析',
      '免费 ARP 可用于检测 IP 地址冲突',
    ],
    explanation: 'ARP 应答是单播，目的 IP 为请求方地址，只有请求方会处理，因此第四项错误。',
    knowledgeId: 'datacom-arp', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-018', type: 'multiple', difficulty: 'IP',
    question: '关于代理 ARP（Proxy ARP），以下说法正确的有？',
    options: [
      '由路由器代替目标主机回应 ARP 请求',
      '可用于主机子网掩码配置错误但需跨网段通信的场景',
      '可减少广播域之间的 ARP 泛洪',
      '代理 ARP 只能在同一广播域内生效',
    ],
    answer: [
      '由路由器代替目标主机回应 ARP 请求',
      '可用于主机子网掩码配置错误但需跨网段通信的场景',
      '可减少广播域之间的 ARP 泛洪',
    ],
    explanation: '代理 ARP 的典型价值正是跨广播域代答，使请求方误以为目标在同一网段，因此第四项说法与事实相反。',
    knowledgeId: 'datacom-arp', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-019', type: 'multiple', difficulty: 'IP',
    question: '关于 ARP 欺骗攻击及其防御，以下说法正确的有？',
    options: [
      '攻击者通过伪造 ARP 应答篡改受害主机的 ARP 缓存',
      '伪造网关 MAC 可实现流量劫持，属于典型的中间人攻击',
      'DHCP Snooping 建立的绑定表可作为动态 ARP 检测的依据',
      '静态绑定 IP-MAC 可降低被 ARP 欺骗的风险',
    ],
    answer: [
      '攻击者通过伪造 ARP 应答篡改受害主机的 ARP 缓存',
      '伪造网关 MAC 可实现流量劫持，属于典型的中间人攻击',
      'DHCP Snooping 建立的绑定表可作为动态 ARP 检测的依据',
      '静态绑定 IP-MAC 可降低被 ARP 欺骗的风险',
    ],
    explanation: '四项均正确。绑定表 + DAI（动态 ARP 检测）是园区网防御 ARP 欺骗的标准组合，静态绑定则在关键设备（如网关）上进一步加固。',
    knowledgeId: 'datacom-arp', direction: 'datacom', tag: 'real',
  },
  {
    id: 'ex-dc-020', type: 'judge', difficulty: 'IA',
    question: 'ARP 协议的作用是将 IP 地址解析为 MAC 地址。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'ARP（地址解析协议）用于在已知目的 IP 的情况下获知其 MAC 地址，以便在以太网中完成帧的封装。',
    knowledgeId: 'datacom-arp', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-021', type: 'judge', difficulty: 'IA',
    question: 'ARP 缓存表中的表项一旦建立就永不老化，直到设备重启。',
    options: ['正确', '错误'], answer: '错误',
    explanation: 'ARP 表项有老化时间（华为设备动态表项通常为 20 分钟），超时未刷新即被删除，以避免 IP-MAC 映射失效后长期错误。',
    knowledgeId: 'datacom-arp', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-022', type: 'judge', difficulty: 'IP',
    question: '免费 ARP（Gratuitous ARP）的请求报文中，目标 IP 为发送者自身的 IP 地址。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '免费 ARP 的目标 IP 即发送方自己的 IP，用于声明自身地址（更新他人缓存）或检测地址冲突：若收到应答说明该 IP 已被占用。',
    knowledgeId: 'datacom-arp', direction: 'datacom', tag: 'hot',
  },

  // ==================== datacom-ethernet  以太网技术 ====================
  {
    id: 'ex-dc-023', type: 'multiple', difficulty: 'IA',
    question: '关于 Ethernet II 帧格式，以下说法正确的有？',
    options: ['目的 MAC 地址占 6 字节', '源 MAC 地址占 6 字节', '类型字段占 2 字节', '数据字段长度范围为 46~1500 字节'],
    answer: ['目的 MAC 地址占 6 字节', '源 MAC 地址占 6 字节', '类型字段占 2 字节', '数据字段长度范围为 46~1500 字节'],
    explanation: 'Ethernet II 帧为「目的 MAC(6B) + 源 MAC(6B) + 类型(2B) + 数据(46~1500B) + FCS(4B)」，四项均正确。最小帧长 64 字节即由此而来。',
    knowledgeId: 'datacom-ethernet', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-024', type: 'multiple', difficulty: 'IA',
    question: '关于 MAC 地址，以下说法正确的有？',
    options: ['MAC 地址共 48 位', '前 24 位为 OUI，用于标识厂商', '单播地址首字节最低位为 0', '广播地址为全 F'],
    answer: ['MAC 地址共 48 位', '前 24 位为 OUI，用于标识厂商', '单播地址首字节最低位为 0', '广播地址为全 F'],
    explanation: '四项均正确。首字节最低位是 I/G 位：0 表示单播、1 表示组播；全 F 是广播地址。',
    knowledgeId: 'datacom-ethernet', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-025', type: 'multiple', difficulty: 'IP',
    question: '关于二层交换机的转发行为，以下说法正确的有？',
    options: [
      '根据帧的源 MAC 学习并建立 MAC 地址表',
      '收到未知单播帧时，向除入端口外的所有端口泛洪',
      '收到已知单播帧时，从对应出端口精确转发',
      '交换机可能将帧从接收该帧的入端口再发回去',
    ],
    answer: [
      '根据帧的源 MAC 学习并建立 MAC 地址表',
      '收到未知单播帧时，向除入端口外的所有端口泛洪',
      '收到已知单播帧时，从对应出端口精确转发',
    ],
    explanation: '交换机会过滤掉从入端口回发的帧（分裂地平线原则），否则会造成不必要的环路与资源浪费，故第四项错误。',
    knowledgeId: 'datacom-ethernet', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-026', type: 'multiple', difficulty: 'IP',
    question: '关于华为交换机的端口模式，以下说法正确的有？',
    options: [
      'Access 端口只属于一个 VLAN',
      'Trunk 端口可以允许多个 VLAN 通过',
      'Hybrid 端口可灵活指定哪些 VLAN 带标签发送、哪些不带',
      'Access 端口发送帧时会保留 802.1Q 标签',
    ],
    answer: [
      'Access 端口只属于一个 VLAN',
      'Trunk 端口可以允许多个 VLAN 通过',
      'Hybrid 端口可灵活指定哪些 VLAN 带标签发送、哪些不带',
    ],
    explanation: 'Access 端口面向终端，发送时剥离 802.1Q 标签，因此第四项错误。Hybrid 是华为设备独有的端口模式。',
    knowledgeId: 'datacom-ethernet', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-027', type: 'judge', difficulty: 'IA',
    question: '集线器工作在物理层，二层交换机工作在数据链路层。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '集线器（Hub）只做信号放大转发，属物理层设备；交换机依据 MAC 地址转发，属数据链路层设备。',
    knowledgeId: 'datacom-ethernet', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-028', type: 'judge', difficulty: 'IA',
    question: '交换机 MAC 地址表的老化时间默认一般为 300 秒。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '华为交换机动态 MAC 表项默认老化时间为 300 秒，超时未刷新则删除，以便适应终端位置变化。',
    knowledgeId: 'datacom-ethernet', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-029', type: 'judge', difficulty: 'IP',
    question: 'CSMA/CD 在半双工模式下工作，全双工模式下无需进行冲突检测。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '全双工的收发通道相互独立，不存在冲突，因此不需要 CSMA/CD；半双工共享介质才需要冲突检测与退避重传。',
    knowledgeId: 'datacom-ethernet', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-030', type: 'judge', difficulty: 'IP',
    question: '以太网最小帧长为 46 字节。',
    options: ['正确', '错误'], answer: '错误',
    explanation: '以太网最小帧长为 64 字节（含 14 字节首部与 4 字节 FCS），其中数据字段最小 46 字节。混淆"数据字段"与"整帧"是常见失分点。',
    knowledgeId: 'datacom-ethernet', direction: 'datacom', tag: 'hot',
  },

  // ==================== datacom-vlan  VLAN ====================
  {
    id: 'ex-dc-031', type: 'multiple', difficulty: 'IA',
    question: '关于 802.1Q 标签，以下说法正确的有？',
    options: ['标签共 4 字节', '包含 12 位的 VLAN ID', 'TPID 字段固定为 0x8100', 'VLAN ID 取值 0 和 4095 保留不用'],
    answer: ['标签共 4 字节', '包含 12 位的 VLAN ID', 'TPID 字段固定为 0x8100', 'VLAN ID 取值 0 和 4095 保留不用'],
    explanation: '802.1Q 标签 = TPID(2B,0x8100) + TCI(2B，含 3 位优先级、1 位 CFI、12 位 VLAN ID)。VLAN ID 可用范围 1~4094，0 与 4095 保留。四项均正确。',
    knowledgeId: 'datacom-vlan', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-032', type: 'judge', difficulty: 'IA',
    question: 'Access 端口接收无标签帧时，会打上该端口 PVID 所对应 VLAN 的标签。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'Access 端口只能承载一个 VLAN，收到无标签帧即按 PVID 打标签入内；发送该 VLAN 帧时再剥离标签。',
    knowledgeId: 'datacom-vlan', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-033', type: 'judge', difficulty: 'IP',
    question: 'Trunk 端口发送本征 VLAN（默认 VLAN 1）的帧时会剥离 802.1Q 标签。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '本征 VLAN（Native VLAN，华为称 PVID）的帧在 Trunk 上以无标签方式发送，这是为了与不支持 802.1Q 的设备兼容。',
    knowledgeId: 'datacom-vlan', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-034', type: 'judge', difficulty: 'IA',
    question: 'VLAN 间通信必须依赖路由器或三层交换机等三层设备。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'VLAN 在二层是隔离的广播域，跨 VLAN 通信必须经过三层转发，常用手段为单臂路由（子接口）或三层交换机的 VLANIF 接口。',
    knowledgeId: 'datacom-vlan', direction: 'datacom', tag: 'hot',
  },

  // ==================== datacom-stp  STP/RSTP/MSTP ====================
  {
    id: 'ex-dc-035', type: 'multiple', difficulty: 'IP',
    question: '关于 STP 的根桥与端口选举，以下说法正确的有？',
    options: [
      '桥 ID 由桥优先级与桥 MAC 组成，取值小者优先',
      '桥优先级默认为 32768',
      '根端口是通往根桥路径开销最小的端口',
      '一台非根交换机上可以存在多个根端口',
    ],
    answer: [
      '桥 ID 由桥优先级与桥 MAC 组成，取值小者优先',
      '桥优先级默认为 32768',
      '根端口是通往根桥路径开销最小的端口',
    ],
    explanation: '每台非根交换机有且仅有一个根端口（通往根桥开销最小的端口），因此第四项错误。这是 STP 的最高频判断点之一。',
    knowledgeId: 'datacom-stp', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-036', type: 'multiple', difficulty: 'IP',
    question: '关于 RSTP 相对 STP 的改进，以下说法正确的有？',
    options: [
      '新增替代端口（Alternate）与备份端口（Backup）两种角色',
      '端口状态简化为 Discarding、Learning、Forwarding 三种',
      '通过 P/A 协商机制实现秒级快速收敛',
      '边缘端口（连接终端）可直接进入转发状态',
    ],
    answer: [
      '新增替代端口（Alternate）与备份端口（Backup）两种角色',
      '端口状态简化为 Discarding、Learning、Forwarding 三种',
      '通过 P/A 协商机制实现秒级快速收敛',
      '边缘端口（连接终端）可直接进入转发状态',
    ],
    explanation: '四项均正确。RSTP 把 STP 的五种端口状态合并为三种，并借助 P/A 逐链路协商与边缘端口机制大幅缩短收敛时间。',
    knowledgeId: 'datacom-stp', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-037', type: 'judge', difficulty: 'IP',
    question: '由于所有交换机的桥优先级默认相同，STP 通常通过比较桥 MAC 地址来选出根桥。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '桥优先级默认均为 32768，因此在未手工调整优先级时，MAC 地址最小的交换机被选为根桥。',
    knowledgeId: 'datacom-stp', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-038', type: 'judge', difficulty: 'IP',
    question: 'MSTP 可将不同 VLAN 映射到不同的生成树实例，从而实现 VLAN 级别的负载分担。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'MSTP（IEEE 802.1s）支持多实例，同一 VLAN 映射到同一实例，不同实例可拥有不同的阻塞端口，从而让冗余链路同时被利用。',
    knowledgeId: 'datacom-stp', direction: 'datacom', tag: 'hot',
  },

  // ==================== datacom-eth-trunk  链路聚合Eth-Trunk ====================
  {
    id: 'ex-dc-039', type: 'single', difficulty: 'IA',
    question: '以下哪项是加入同一 Eth-Trunk 的成员接口必须满足的条件？',
    options: ['仅速率一致即可', '仅双工模式一致即可', '仅 VLAN 配置一致即可', '速率、双工模式、链路类型与 VLAN 配置均一致'],
    answer: '速率、双工模式、链路类型与 VLAN 配置均一致',
    explanation: '成员接口的参数必须完全一致（速率、双工、链路类型、VLAN 配置），否则无法成功加入聚合组，这是配置环节最常见的排障点。',
    knowledgeId: 'datacom-eth-trunk', direction: 'datacom', tag: 'real',
  },
  {
    id: 'ex-dc-040', type: 'multiple', difficulty: 'IP',
    question: '关于 Eth-Trunk 的两种工作模式，以下说法正确的有？',
    options: [
      '手工负载分担模式下所有活动链路都参与流量转发',
      'LACP 模式通过 LACPDU 协商确定活动链路',
      'LACP 模式可配置活动接口数的上限与下限',
      'LACP 模式下备用链路也会参与数据转发',
    ],
    answer: [
      '手工负载分担模式下所有活动链路都参与流量转发',
      'LACP 模式通过 LACPDU 协商确定活动链路',
      'LACP 模式可配置活动接口数的上限与下限',
    ],
    explanation: 'LACP 模式下的备用链路处于非活动状态，不转发数据，只有活动链路故障时才被顶上，因此第四项错误。',
    knowledgeId: 'datacom-eth-trunk', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-041', type: 'multiple', difficulty: 'IP',
    question: '关于 LACP 优先级，以下说法正确的有？',
    options: [
      '系统优先级数值小的一端优先成为主动端',
      '接口优先级数值小的接口优先成为活动接口',
      '系统优先级由优先级值与系统 MAC 共同构成',
      '接口优先级仅在被被动端生效，主动端不参与比较',
    ],
    answer: [
      '系统优先级数值小的一端优先成为主动端',
      '接口优先级数值小的接口优先成为活动接口',
      '系统优先级由优先级值与系统 MAC 共同构成',
    ],
    explanation: '两端都会参与优先级比较，用于确定主动端与最终的活动接口集合，因此第四项错误。',
    knowledgeId: 'datacom-eth-trunk', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-042', type: 'multiple', difficulty: 'IP',
    question: '关于 Eth-Trunk 的负载分担，以下说法正确的有？',
    options: [
      '可基于源 MAC 或目的 MAC 进行哈希分担',
      '可基于源 IP 或目的 IP 进行哈希分担',
      '可基于源端口或目的端口进行哈希分担',
      '同一条数据流的报文会被分散到不同成员链路上转发',
    ],
    answer: [
      '可基于源 MAC 或目的 MAC 进行哈希分担',
      '可基于源 IP 或目的 IP 进行哈希分担',
      '可基于源端口或目的端口进行哈希分担',
    ],
    explanation: '为避免报文乱序，同一条数据流的报文通常被哈希到同一条成员链路，因此第四项错误。',
    knowledgeId: 'datacom-eth-trunk', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-043', type: 'judge', difficulty: 'IP',
    question: '在成员接口上可以直接配置业务，然后再将其加入 Eth-Trunk。',
    options: ['正确', '错误'], answer: '错误',
    explanation: '成员接口不能直接配置业务，相关配置（如 VLAN）必须在 Eth-Trunk 逻辑接口上完成，成员接口只作为转发通道。',
    knowledgeId: 'datacom-eth-trunk', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-044', type: 'judge', difficulty: 'IP',
    question: '一个 Eth-Trunk 通常最多可包含 8 条成员链路。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '华为设备一个 Eth-Trunk 默认最多支持 8 条成员链路（部分设备或新版本可支持更多），这是配置时的常见限制。',
    knowledgeId: 'datacom-eth-trunk', direction: 'datacom', tag: 'hot',
  },

  // ==================== datacom-stack  堆叠iStack/CSS ====================
  {
    id: 'ex-dc-045', type: 'single', difficulty: 'IP',
    question: '堆叠系统选举主交换机（Master）时，优先比较的字段是？',
    options: ['堆叠优先级，数值大者优先', 'MAC 地址，数值大者优先', '堆叠 ID，数值大者优先', '设备运行时长，时长长者优先'],
    answer: '堆叠优先级，数值大者优先',
    explanation: '主交换机选举规则：先比较堆叠优先级（大者优先），若相同则比较 MAC 地址（小者优先）。注意与 STP 根桥选举（桥优先级小者优先）方向相反，是高频易错点。',
    knowledgeId: 'datacom-stack', direction: 'datacom', tag: 'real',
  },
  {
    id: 'ex-dc-046', type: 'multiple', difficulty: 'IP',
    question: '关于堆叠（iStack/CSS）带来的收益，以下说法正确的有？',
    options: [
      '多台设备虚拟为一台逻辑设备，简化运维管理',
      '支持跨设备链路聚合，提升链路可靠性',
      '扩展端口密度，提升接入能力',
      '堆叠后各成员设备仍需要各自独立的管理 IP',
    ],
    answer: [
      '多台设备虚拟为一台逻辑设备，简化运维管理',
      '支持跨设备链路聚合，提升链路可靠性',
      '扩展端口密度，提升接入能力',
    ],
    explanation: '堆叠后整个系统对外表现为一台设备，只需一个管理 IP，因此第四项错误。',
    knowledgeId: 'datacom-stack', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-047', type: 'multiple', difficulty: 'IP',
    question: '关于堆叠的连接与标识，以下说法正确的有？',
    options: [
      '可通过业务口配合专用线缆进行堆叠连接',
      '可通过专用堆叠卡进行堆叠连接',
      '每台成员设备拥有唯一的堆叠 ID',
      '堆叠链路的带宽会影响堆叠系统的转发性能',
    ],
    answer: [
      '可通过业务口配合专用线缆进行堆叠连接',
      '可通过专用堆叠卡进行堆叠连接',
      '每台成员设备拥有唯一的堆叠 ID',
      '堆叠链路的带宽会影响堆叠系统的转发性能',
    ],
    explanation: '四项均正确。堆叠链路承担成员间流量，其带宽与可靠性直接影响堆叠系统整体性能，因此工程上常做堆叠链路冗余。',
    knowledgeId: 'datacom-stack', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-048', type: 'multiple', difficulty: 'IE',
    question: '关于堆叠分裂与多主检测（MAD），以下说法正确的有？',
    options: [
      '堆叠链路故障可能导致堆叠系统分裂',
      '分裂后可能出现双主，引发网络异常',
      'MAD 用于检测并处理堆叠分裂',
      '堆叠分裂后无需任何处理，成员设备会自动恢复为原堆叠',
    ],
    answer: [
      '堆叠链路故障可能导致堆叠系统分裂',
      '分裂后可能出现双主，引发网络异常',
      'MAD 用于检测并处理堆叠分裂',
    ],
    explanation: '分裂后两条"半堆叠"各自独立运行，都会认为自己是主，必须依赖 MAD 机制检测并关闭其中一侧的业务口，因此第四项错误。',
    knowledgeId: 'datacom-stack', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-049', type: 'judge', difficulty: 'IA',
    question: '堆叠完成后，各成员交换机共用同一个管理 IP，从而简化管理。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '堆叠系统对外表现为一台逻辑设备，统一使用主交换机的管理 IP，这正是堆叠"简化管理"的核心价值。',
    knowledgeId: 'datacom-stack', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-050', type: 'judge', difficulty: 'IP',
    question: '堆叠优先级数值越大，越优先被选举为主交换机。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '堆叠主交换机选举中堆叠优先级大者优先，与 STP 根桥"优先级小者优先"的规则相反，考试中极易混淆。',
    knowledgeId: 'datacom-stack', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-051', type: 'judge', difficulty: 'IP',
    question: '堆叠链路断裂后，堆叠系统会立即自动恢复为分裂前的状态。',
    options: ['正确', '错误'], answer: '错误',
    explanation: '堆叠链路断裂会造成堆叠分裂，需要通过 MAD 检测与处理（关闭一侧业务口）来避免双主，不会自动恢复。',
    knowledgeId: 'datacom-stack', direction: 'datacom', tag: 'hot',
  },
  {
    id: 'ex-dc-052', type: 'judge', difficulty: 'IP',
    question: '跨设备 Eth-Trunk 允许将不同成员交换机上的接口加入同一个 Eth-Trunk。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '这是堆叠的核心优势之一：服务器双上行分别接到两台成员交换机，仍可聚合成一条逻辑链路，实现链路级冗余。',
    knowledgeId: 'datacom-stack', direction: 'datacom', tag: 'hot',
  },
]
