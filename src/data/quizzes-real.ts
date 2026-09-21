// 华为ICT大赛 全国总决赛 理论真题（2023-2025 公开真题 + 官方样题）
// 全部 tag: 'real'，冲刺期可一键筛选只刷真题
import type { IQuizQuestion } from './quizzes'

export const EXTRA_QUIZZES_REAL: IQuizQuestion[] = [
  // ===== 2024-2025 全国总决赛（高职组）数通模块真题 =====
  {
    id: 'real-dc-001',
    type: 'single',
    question: '公司在数据中心内部署两台核心路由器 Router A 和 Router B，使用 VRRP 提供高可用默认网关。Router A 配置为 Master，Router B 为备份。要求 Router A 故障时 Router B 平稳接管，且 Router A 故障恢复后不立刻成为 Master。以下哪项部署方案合理？',
    options: [
      '在 Router B 上配置较高优先级并启用抢占功能',
      '在 Router A 和 Router B 上配置相同优先级并启用抢占功能',
      '在 Router A 上配置较高优先级并禁用抢占功能',
      '在 Router A 上配置较高优先级，在 Router B 上配置并启用抢占功能'
    ],
    answer: '在 Router A 上配置较高优先级并禁用抢占功能',
    explanation: 'VRRP 中 Master 优先级更高。题干要求"A 恢复后不立刻成为 Master"，即非抢占模式：即使检测到更高优先级设备恢复，Backup 也不立刻切回。因此 A 配高优先级、全局禁用抢占。',
    knowledgeId: 'datacom-vrrp',
    direction: 'datacom', difficulty: 'IP', tag: 'real',
  },
  {
    id: 'real-dc-002',
    type: 'single',
    question: '某运营商核心网部署 SRv6 实现流量灵活调度。排查某条 SRv6 路径流量未按预期转发时，怀疑 Segment List 配置错误。以下哪一项不应该出现在 Segment List 中？',
    options: [
      '路径节点上的 END SID',
      '路径节点上的 END.X SID',
      '路径节点上环回口的 IPv6 地址',
      '路径某段节点的 Binding SID'
    ],
    answer: '路径节点上环回口的 IPv6 地址',
    explanation: 'Segment List 只承载具有 SID 行为的 SID（END/END.X/Binding SID 等）。普通环回口 IPv6 地址如果未被配置为有效 SID，就没有对应的 SID 指令行为，不能出现在 Segment List 中。',
    knowledgeId: 'datacom-ipv6',
    direction: 'datacom', difficulty: 'IE', tag: 'real',
  },
  {
    id: 'real-dc-003',
    type: 'single',
    question: '某企业 BGP 路由策略使用前缀列表精确控制从对等体接收的路由，配置为：ip ip-prefix PL permit 172.16.16.0 20 greater-equal 21 less-equal 24。该前缀列表可以匹配多少条路由？',
    options: ['16', '24', '30', '32'],
    answer: '30',
    explanation: '前 20 位必须精确匹配 172.16.16.0，掩码长度在 21~24 之间：/21 匹配 2^1=2 条，/22 匹配 2^2=4 条，/23 匹配 2^3=8 条，/24 匹配 2^4=16 条，合计 2+4+8+16=30 条。',
    knowledgeId: 'datacom-route-policy',
    direction: 'datacom', difficulty: 'IE', tag: 'real',
  },
  {
    id: 'real-dc-004',
    type: 'single',
    question: '跨域 VPN 采用 Option A 方案，CE1 和 CE2 属于同一 VPN，配置完成后 CE1 不能 ping 通 CE2。检查各 PE 和 ASBR 上 vpn-instance 配置后，以下哪项是故障原因？',
    options: [
      'ASBR1 和 ASBR2 的 VPN RD 值不相同',
      'ASBR1 和 ASBR2 的 VPN RT 值不相同',
      'ASBR2 和 PE2 的 VPN RD 值不相同',
      'ASBR2 和 PE2 的 VPN RT 值不相同'
    ],
    answer: 'ASBR2 和 PE2 的 VPN RT 值不相同',
    explanation: 'Option A 中各 ASBR 之间以普通 IPv4 方式转发 VPN 报文，RT 负责将路由引入对应 VPN 实例。ASBR2 与 PE2 之间 RT 不匹配会导致路由无法正确导入，造成 CE1 与 CE2 不通。RD 只负责区分 VR 的地址空间，不影响转发可达性。',
    knowledgeId: 'datacom-mpls-vpn',
    direction: 'datacom', difficulty: 'IE', tag: 'real',
  },

  // ===== 2023-2024 全国总决赛 经典真题 =====
  {
    id: 'real-dc-005',
    type: 'single',
    question: '主机使用以下哪个 IPv4 地址不能直接访问 Internet？',
    options: ['200.1.1.1', '50.1.1.1', '100.1.1.1', '10.1.1.1'],
    answer: '10.1.1.1',
    explanation: '10.0.0.0/8 是 A 类私网地址（RFC 1918），不能直接在公网上路由，需经 NAT 转换后才能访问 Internet。200/50/100 开头均为公网单播地址。',
    knowledgeId: 'datacom-ip-subnet',
    direction: 'datacom', difficulty: 'IA', tag: 'real',
  },
  {
    id: 'real-dc-006',
    type: 'single',
    question: '关于华为 VLAN 聚合（Super-VLAN），以下说法错误的是？',
    options: [
      'Super-VLAN 不能包含物理端口，端口只能加入 Sub-VLAN',
      'Sub-VLAN 之间二层隔离，需通过 Super-VLAN 的 VLANIF 实现三层互通',
      'Sub-VLAN 间默认可直接二层互通，无需任何配置',
      '需开启 Sub-VLAN 间 ARP 代理才能实现三层互访'
    ],
    answer: 'Sub-VLAN 间默认可直接二层互通，无需任何配置',
    explanation: 'Super-VLAN（VLAN 聚合）中 Sub-VLAN 之间二层隔离，必须借助 Super-VLAN 的 VLANIF 接口和 Sub-VLAN 间 ARP 代理才能三层互通。',
    knowledgeId: 'datacom-vlan-aggregate',
    direction: 'datacom', difficulty: 'IP', tag: 'real',
  },
  {
    id: 'real-dc-007',
    type: 'single',
    question: '拥塞避免通常采用的 QoS 技术是？',
    options: ['PQ 队列调度', 'WFQ 队列调度', 'RED/WRED 随机早期检测', 'LR 流量监管'],
    answer: 'RED/WRED 随机早期检测',
    explanation: '拥塞避免通过 RED/WRED 在队列未满前随机丢弃部分报文，提醒源端降低发送速率，避免尾部丢弃导致全局同步。PQ/WFQ 是拥塞管理（队列调度），CAR/LR 是流量监管。',
    knowledgeId: 'datacom-qos',
    direction: 'datacom', difficulty: 'IP', tag: 'real',
  },
  {
    id: 'real-dc-008',
    type: 'single',
    question: '包过滤防火墙主要对 OSI 哪一层的数据报文进行检查？',
    options: ['物理层', '数据链路层', '网络层', '应用层'],
    answer: '网络层',
    explanation: '包过滤防火墙基于五元组（源/目的 IP、源/目的端口、协议号）在网络层/传输层检查报文，不识别应用层内容。状态检测防火墙会跟踪会话状态，应用网关/NGFW 才深入应用层。',
    knowledgeId: 'security-firewall',
    direction: 'security', difficulty: 'IA', tag: 'real',
  },

  // ===== 安全方向真题 =====
  {
    id: 'real-se-001',
    type: 'single',
    question: '针对 SIP Flood 攻击，华为防火墙能采取以下哪一项防范技术？',
    options: ['指纹防范', '首包丢弃', '源探测', '限流'],
    answer: '源探测',
    explanation: 'SIP Flood 是应用层 DDoS 攻击，华为防火墙通过 SIP 源探测（挑战/质询机制）识别合法用户，拒绝未完成探测的伪造源发起的大量呼叫请求，从而防范 SIP Flood。',
    knowledgeId: 'security-attack-defense',
    direction: 'security', difficulty: 'IP', tag: 'real',
  },
  {
    id: 'real-se-002',
    type: 'single',
    question: '关于等保 2.0"一个中心、三重防护"，以下哪项不属于"三重防护"？',
    options: [
      '安全通信网络',
      '安全区域边界',
      '安全计算环境',
      '安全运维管理中心'
    ],
    answer: '安全运维管理中心',
    explanation: '等保 2.0"三重防护"指安全通信网络、安全区域边界、安全计算环境；"一个中心"指安全管理中心。安全运维管理中心不是标准提法。',
    knowledgeId: 'security-management',
    direction: 'security', difficulty: 'IP', tag: 'real',
  },
  {
    id: 'real-se-003',
    type: 'single',
    question: '数字签名的正确用法是？',
    options: [
      '发送方用公钥加密摘要，接收方用私钥解密',
      '发送方用私钥对摘要签名，接收方用公钥验签',
      '发送方用对称密钥加密报文，接收方用同一密钥解密',
      '发送方用 CA 的公钥加密报文，接收方用 CA 的私钥解密'
    ],
    answer: '发送方用私钥对摘要签名，接收方用公钥验签',
    explanation: '数字签名：发送方用自己的私钥对报文摘要加密（签名），接收方用发送方的公钥解密验签，提供身份认证、完整性和不可否认性。注意"公钥加密、私钥解密"是加密场景，不是签名。',
    knowledgeId: 'security-pki',
    direction: 'security', difficulty: 'IA', tag: 'real',
  },

  // ===== WLAN 方向真题（含官方样题） =====
  {
    id: 'real-wl-001',
    type: 'single',
    question: '在无线控制器上配置 WLAN 安全策略，可对无线终端进行身份验证、对用户报文进行加密。当前无线控制器支持配置的 WLAN 安全策略不包括以下哪一项？',
    options: ['WPA4-SAE', 'WPA3-SAE', 'WEP', 'WPA/WPA2-PSK'],
    answer: 'WPA4-SAE',
    explanation: '当前 WLAN 安全标准演进到 WPA3（SAE 替代 PSK 防字典攻击），WEP 虽已不安全但设备仍兼容支持。WPA4 尚未成为正式标准，因此控制器不支持 WPA4-SAE。',
    knowledgeId: 'wlan-security',
    direction: 'wlan', difficulty: 'IA', tag: 'real',
  },
  {
    id: 'real-wl-002',
    type: 'single',
    question: '关于 WLAN 中 Fit AP 与 AC 之间的 CAPWAP 隧道，以下说法正确的是？',
    options: [
      '控制隧道使用 UDP 5246，数据隧道使用 UDP 5247',
      '控制隧道使用 TCP 443，数据隧道使用 UDP 53',
      'Fit AP 独立转发，不与 AC 建立任何隧道',
      'CAPWAP 只能通过广播方式发现 AC'
    ],
    answer: '控制隧道使用 UDP 5246，数据隧道使用 UDP 5247',
    explanation: 'CAPWAP 控制隧道（AP 与 AC 间管理报文）UDP 5246，数据隧道（用户数据转发）UDP 5247。Fit AP 必须与 AC 建立 CAPWAP 隧道，可通过二层广播、三层单播、DHCP Option 43、DNS 等多种方式发现 AC。',
    knowledgeId: 'wlan-sta-online',
    direction: 'wlan', difficulty: 'IP', tag: 'real',
  },
  {
    id: 'real-wl-003',
    type: 'single',
    question: '关于 802.11ax（Wi-Fi 6）技术，以下说法错误的是？',
    options: [
      'OFDMA 可将信道划分为多个资源单元 RU，实现多用户并行传输',
      'MU-MIMO 支持多用户同时收发数据',
      '1024-QAM 相比 256-QAM 可提升约 25% 速率',
      'Wi-Fi 6 仅工作在 5GHz 频段，不支持 2.4GHz'
    ],
    answer: 'Wi-Fi 6 仅工作在 5GHz 频段，不支持 2.4GHz',
    explanation: 'Wi-Fi 6（802.11ax）同时支持 2.4GHz 和 5GHz；Wi-Fi 6E 才扩展支持 6GHz。其余关于 OFDMA、MU-MIMO、1024-QAM 的描述均正确。',
    knowledgeId: 'wlan-wifi6',
    direction: 'wlan', difficulty: 'IP', tag: 'real',
  },
  {
    id: 'real-wl-004',
    type: 'multiple',
    question: '关于 WLAN 无线网络规划，以下说法正确的有？',
    options: [
      '2.4GHz 中国可用互不重叠信道为 1/6/11',
      'AP 发射功率越大越好，覆盖范围一定更大',
      '频谱导航可引导双频终端优先接入 5GHz 频段',
      '高密场景应降低单 AP 功率、缩小蜂窝并启用负载均衡'
    ],
    answer: [
      '2.4GHz 中国可用互不重叠信道为 1/6/11',
      '频谱导航可引导双频终端优先接入 5GHz 频段',
      '高密场景应降低单 AP 功率、缩小蜂窝并启用负载均衡'
    ],
    explanation: '2.4GHz 互不重叠信道 1/6/11 正确。AP 功率并非越大越好：功率过大会导致同频干扰加剧和漫游粘滞，反而降低整体性能。频谱导航（Band Steer）引导终端优先 5GHz，高密场景需缩小蜂窝+负载均衡。',
    knowledgeId: 'wlan-planning',
    direction: 'wlan', difficulty: 'IP', tag: 'real',
  },

  // ===== 省赛/校赛 理论真题（资格赛 + 复赛高频考点） =====
  {
    id: 'real-sv-001',
    type: 'single',
    question: '组建了双机热备系统的华为防火墙，在重启后一定不会同步以下哪一项配置？',
    options: ['Session Table（会话表）', '安全策略', 'NAT 策略', 'IP-Link 配置'],
    answer: 'Session Table（会话表）',
    explanation: 'HRP 同步静态配置与策略（安全策略、NAT、IP-Link 等），但会话表是设备运行时动态建立的，重启后会话表清空、不会从对端同步，业务连接需重新建立。',
    knowledgeId: 'security-ha',
    direction: 'security', difficulty: 'IA', tag: 'real',
  },
  {
    id: 'real-sv-002',
    type: 'single',
    question: '若两台路由器刚通过 Hello 报文建立完整邻接关系，通过 display ospf peer brief 查看邻居状态，应为以下哪一项？',
    options: ['Exchange', 'Full', '2-Way', 'ExStart'],
    answer: 'Full',
    explanation: 'OSPF 状态机中 Full 表示 LSDB 已同步完成、邻接关系完整建立。2-Way 只是邻居发现，ExStart/Exchange 是协商与交换阶段。',
    knowledgeId: 'datacom-ospf',
    direction: 'datacom', difficulty: 'IA', tag: 'real',
  },
  {
    id: 'real-sv-003',
    type: 'single',
    question: 'OSPF 动态路由协议有多种报文，其中携带完整 LSA 信息的是以下哪一类型报文？',
    options: ['LSU（链路状态更新）', 'DD（数据库描述）', 'Hello', 'LSR（链路状态请求）'],
    answer: 'LSU（链路状态更新）',
    explanation: 'LSU 携带完整 LSA 泛洪；DD 只携带 LSA 头部摘要用于数据库同步；LSR 请求缺失 LSA；Hello 用于邻居发现与保活。',
    knowledgeId: 'datacom-ospf',
    direction: 'datacom', difficulty: 'IP', tag: 'real',
  },
  {
    id: 'real-sv-004',
    type: 'single',
    question: '关于免费 ARP（Gratuitous ARP），以下描述错误的是？',
    options: [
      '攻击者可使用伪造的免费 ARP 报文进行中间人攻击',
      '主机新接入时发送免费 ARP 用于检测 IP 地址冲突',
      '免费 ARP 只能由网关设备发送，主机不能发送',
      '免费 ARP 报文的源 IP 与目的 IP 均为主机自身 IP'
    ],
    answer: '免费 ARP 只能由网关设备发送，主机不能发送',
    explanation: '任何主机都可发送免费 ARP，用于 IP 冲突检测和宣告自身 MAC 映射。伪造免费 ARP 可实现 ARP 欺骗/中间人攻击，这是免费 ARP 的典型安全风险。',
    knowledgeId: 'datacom-arp',
    direction: 'datacom', difficulty: 'IP', tag: 'real',
  },
  {
    id: 'real-sv-005',
    type: 'single',
    question: '生成树协议（STP）中，通过哪个参数来选举根桥（Root Bridge）？',
    options: ['桥优先级（Bridge Priority）', '接口 ID', '根路径开销', '转发延迟'],
    answer: '桥优先级（Bridge Priority）',
    explanation: 'STP 选举根桥比较 BID（桥 ID）= 桥优先级 + MAC，优先级越小越优先；优先级相同时再比较 MAC 地址。接口 ID 和路径开销用于端口角色选择，不影响根桥选举。',
    knowledgeId: 'datacom-stp',
    direction: 'datacom', difficulty: 'IA', tag: 'real',
  },
  {
    id: 'real-sv-006',
    type: 'single',
    question: '华为交换机 Access 端口在向外发送数据帧时，对 VLAN Tag 的处理方式是？',
    options: [
      '打上本端口 PVID 信息后再发送',
      '直接发送带 Tag 的报文',
      '剥除报文 VLAN Tag 信息后再发送',
      '自动添加新的 VLAN Tag 后再发送'
    ],
    answer: '剥除报文 VLAN Tag 信息后再发送',
    explanation: 'Access 端口只属于一个 VLAN，接收带 Tag 报文时检查是否等于 PVID；向外发送时必须剥除 Tag（因为下联 PC 不识别 Tag）。Trunk 端口才允许带 Tag 转发。',
    knowledgeId: 'datacom-vlan',
    direction: 'datacom', difficulty: 'IA', tag: 'real',
  },
  {
    id: 'real-sv-007',
    type: 'single',
    question: 'IEEE 802.11 系列标准中，理论协商速率最高、最新一代的 Wi-Fi 标准是？',
    options: ['802.11a', '802.11b', '802.11n', '802.11ax'],
    answer: '802.11ax',
    explanation: '802.11ax（Wi-Fi 6）通过 OFDMA、1024-QAM、MU-MIMO 等技术，理论协商速率可达数 Gbps，远超 a/b/n/ac。',
    knowledgeId: 'wlan-standard',
    direction: 'wlan', difficulty: 'IA', tag: 'real',
  },
  {
    id: 'real-sv-008',
    type: 'single',
    question: '在华为无线控制器上配置 Portal 认证，以下哪一项不是必须配置的模板？',
    options: ['MAC 模板', 'RADIUS 模板', 'Portal 模板', 'URL 模板'],
    answer: 'MAC 模板',
    explanation: 'Portal 认证需要 Portal 模板（认证服务器参数）、RADIUS 模板（与认证服务器对接）、URL 模板（推送 Portal 页面地址）。MAC 模板用于 MAC 认证，不是 Portal 认证必须项。',
    knowledgeId: 'security-portal',
    direction: 'security', difficulty: 'IP', tag: 'real',
  },
  {
    id: 'real-sv-009',
    type: 'single',
    question: 'IPv6 地址的长度固定为多少位？',
    options: ['32 位', '64 位', '128 位', '256 位'],
    answer: '128 位',
    explanation: 'IPv6 地址长度为 128 位，是 IPv4（32 位）的 4 倍，采用冒号分隔的十六进制表示，极大扩展了地址空间。',
    knowledgeId: 'datacom-ipv6-basic',
    direction: 'datacom', difficulty: 'IA', tag: 'real',
  },
  {
    id: 'real-sv-010',
    type: 'single',
    question: '在华为 ARG3 路由器上，用于查看 MAC 地址表的命令是？',
    options: ['display mac-address', 'display ip routing-table', 'display arp', 'display vlan'],
    answer: 'display mac-address',
    explanation: 'display mac-address 查看 MAC 地址表（VLAN/端口/类型）；display arp 查看 ARP 表（IP-MAC 映射）；display ip routing-table 查看路由表。',
    knowledgeId: 'datacom-ethernet',
    direction: 'datacom', difficulty: 'IA', tag: 'real',
  },
  {
    id: 'real-sv-011',
    type: 'single',
    question: '入侵防御系统（IPS）特征库通常默认包含以下哪一类签名用于检测已知攻击？',
    options: ['预定义签名', '自定义签名', '签名过滤器', '例外签名'],
    answer: '预定义签名',
    explanation: 'IPS 特征库出厂自带预定义签名，用于识别已知攻击模式；自定义签名、签名过滤器和例外签名都需要管理员根据实际网络环境另行配置。',
    knowledgeId: 'security-ips-ids',
    direction: 'security', difficulty: 'IA', tag: 'real',
  },
  {
    id: 'real-sv-012',
    type: 'multiple',
    question: '关于 VRRP 虚拟路由冗余协议，以下说法正确的有？',
    options: [
      '只有 Master 路由器负责转发发往虚拟 IP 的流量',
      'Backup 路由器平时不转发用户流量',
      'VRRP 通过虚拟 MAC 地址实现网关冗余',
      'VRRP 必须依赖 OSPF 才能工作'
    ],
    answer: [
      '只有 Master 路由器负责转发发往虚拟 IP 的流量',
      'Backup 路由器平时不转发用户流量',
      'VRRP 通过虚拟 MAC 地址实现网关冗余'
    ],
    explanation: 'VRRP 将多台路由器虚拟成一台虚拟网关，只有 Master 转发流量，Backup 平时不转发；虚拟 MAC（00-00-5E-00-01-{VRID}）让终端无感知切换。VRRP 是独立协议，不依赖 OSPF。',
    knowledgeId: 'datacom-vrrp',
    direction: 'datacom', difficulty: 'IP', tag: 'real',
  },
]