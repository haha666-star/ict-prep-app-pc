/**
 * 题库扩容（第五批）：安全 · 基础概念 / 加解密 / 防火墙 / NAT / 攻击防御 / 各类 VPN
 *
 * 目标：每个考点 单选>=3 / 多选>=4 / 判断>=4；IPSec、防火墙、攻击防御为
 * 安全方向最高频考点，额外加码。
 * 标签口径见 quizzes-expand-a.ts（real=真题同源考法，非原题收录）。
 */
import type { IQuizQuestion } from './quizzes'

export const EXTRA_QUIZZES_EXPAND_E: IQuizQuestion[] = [
  // ==================== security-concept  安全基本概念 ====================
  {
    id: 'ex-sec-001', type: 'multiple', difficulty: 'IA',
    question: '关于信息安全三要素（CIA），以下说法正确的有？',
    options: [
      '机密性指防止信息被未授权者获取',
      '完整性指防止信息被未授权篡改',
      '可用性指保证授权用户能够正常访问资源',
      'CIA 中的 A 指认证（Authentication）',
    ],
    answer: [
      '机密性指防止信息被未授权者获取',
      '完整性指防止信息被未授权篡改',
      '可用性指保证授权用户能够正常访问资源',
    ],
    explanation: 'CIA 中的 A 是可用性（Availability），不是认证。认证属于安全机制的范畴，与该模型中的三要素不是同一概念。',
    knowledgeId: 'security-concept', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-002', type: 'multiple', difficulty: 'IA',
    question: '关于攻击类型的分类，以下说法正确的有？',
    options: [
      '窃听与流量分析属于被动攻击',
      '篡改、伪造、重放属于主动攻击',
      '被动攻击不改变数据内容',
      '被动攻击会直接破坏数据的完整性',
    ],
    answer: ['窃听与流量分析属于被动攻击', '篡改、伪造、重放属于主动攻击', '被动攻击不改变数据内容'],
    explanation: '被动攻击只做信息收集（不篡改数据），因此不会破坏完整性；破坏完整性的行为属于主动攻击。',
    knowledgeId: 'security-concept', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-003', type: 'multiple', difficulty: 'IA',
    question: '关于病毒、蠕虫与木马的区别，以下说法正确的有？',
    options: [
      '病毒需要依附宿主程序，能够自我复制',
      '蠕虫是独立程序，可利用系统漏洞主动传播',
      '木马通常伪装成合法程序，用于窃取信息或远程控制',
      '三者都必须依附宿主程序才能运行',
    ],
    answer: [
      '病毒需要依附宿主程序，能够自我复制',
      '蠕虫是独立程序，可利用系统漏洞主动传播',
      '木马通常伪装成合法程序，用于窃取信息或远程控制',
    ],
    explanation: '蠕虫与木马都可独立运行，只有病毒必须依附宿主，因此第四项错误。三者的传播方式差异是高频判断题。',
    knowledgeId: 'security-concept', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-004', type: 'judge', difficulty: 'IA',
    question: '信息安全三要素指机密性、完整性与可用性。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '这就是经典的 CIA 模型，几乎每场考试都会以直接或间接形式出现，属于必背内容。',
    knowledgeId: 'security-concept', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-005', type: 'judge', difficulty: 'IA',
    question: '被动攻击会破坏数据的完整性。',
    options: ['正确', '错误'], answer: '错误',
    explanation: '被动攻击（窃听、流量分析）只获取信息而不修改数据，因此不破坏完整性，也不易被发现。',
    knowledgeId: 'security-concept', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-006', type: 'judge', difficulty: 'IA',
    question: '最小权限原则要求用户与程序只拥有完成其工作所必需的最小权限。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '该原则可显著缩小被攻击面：即使某账号被盗，其能造成的破坏也被限制在最小范围内。',
    knowledgeId: 'security-concept', direction: 'security', tag: 'hot',
  },

  // ==================== security-crypto  加解密技术 ====================
  {
    id: 'ex-sec-007', type: 'judge', difficulty: 'IA',
    question: '对称加密算法的加密与解密使用同一密钥，加解密速度快。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '对称加密（AES、SM4 等）速度快、适合大数据量加密，但密钥分发与管理是难点，这也是引入非对称加密的原因之一。',
    knowledgeId: 'security-crypto', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-008', type: 'judge', difficulty: 'IP',
    question: '数字签名由发送方使用私钥生成，接收方使用公钥进行验证。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '数字签名提供身份认证、完整性与不可否认性。注意其密钥使用方向与"公钥加密、私钥解密"恰好相反。',
    knowledgeId: 'security-crypto', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-009', type: 'judge', difficulty: 'IP',
    question: 'MD5 与 SHA-1 目前已不再被视为安全的哈希算法。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '两者均已被证实存在碰撞攻击，现网推荐使用 SHA-2/SHA-3 或国密 SM3 等更强的哈希算法。',
    knowledgeId: 'security-crypto', direction: 'security', tag: 'hot',
  },

  // ==================== security-firewall-basic  防火墙基础 ====================
  {
    id: 'ex-sec-010', type: 'multiple', difficulty: 'IP',
    question: '关于华为防火墙的默认安全区域，以下说法正确的有？',
    options: ['Local 区域优先级为 100', 'Trust 区域优先级为 85', 'Untrust 区域优先级为 5', '安全区域优先级数值越小表示越可信'],
    answer: ['Local 区域优先级为 100', 'Trust 区域优先级为 85', 'Untrust 区域优先级为 5'],
    explanation: '优先级数值越大越可信（Local 100 > Trust 85 > DMZ 50 > Untrust 5），因此第四项方向写反了。',
    knowledgeId: 'security-firewall-basic', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-011', type: 'multiple', difficulty: 'IP',
    question: '关于防火墙的状态检测机制，以下说法正确的有？',
    options: [
      '首包需要通过安全策略检查',
      '后续报文可以直接匹配会话来转发',
      '会话表记录了连接的地址与状态信息',
      '每一条报文都必须重新逐包执行完整的安全策略匹配',
    ],
    answer: [
      '首包需要通过安全策略检查',
      '后续报文可以直接匹配会话来转发',
      '会话表记录了连接的地址与状态信息',
    ],
    explanation: '状态检测的价值恰恰在于"只查首包、后续查会话"，避免逐包匹配策略带来的性能损耗，因此第四项错误。',
    knowledgeId: 'security-firewall-basic', direction: 'security', tag: 'hot',
  },

  // ==================== security-nat  防火墙NAT ====================
  {
    id: 'ex-sec-012', type: 'multiple', difficulty: 'IP',
    question: '关于防火墙上的源 NAT，以下说法正确的有？',
    options: [
      'PAT 会转换端口，可实现多对一转换',
      'No-PAT 不转换端口，一对一占用公网地址',
      'Easy-IP 直接使用出接口地址进行转换',
      'No-PAT 更适合大量内网用户共享少量公网地址的场景',
    ],
    answer: [
      'PAT 会转换端口，可实现多对一转换',
      'No-PAT 不转换端口，一对一占用公网地址',
      'Easy-IP 直接使用出接口地址进行转换',
    ],
    explanation: 'No-PAT 不转换端口，一个公网地址同时只能服务一个内网用户，不适合"多用户共享少地址"，应选 PAT，因此第四项错误。',
    knowledgeId: 'security-nat', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-013', type: 'multiple', difficulty: 'IP',
    question: '在防火墙上部署 NAT Server 时，以下说法正确的有？',
    options: [
      '用于让外网用户访问内网服务器',
      '支持配置端口映射',
      'NAT 不能替代安全策略，流量仍需被安全策略允许',
      '命中 NAT Server 的流量可以跳过安全策略检查',
    ],
    answer: ['用于让外网用户访问内网服务器', '支持配置端口映射', 'NAT 不能替代安全策略，流量仍需被安全策略允许'],
    explanation: 'NAT 只解决地址转换，是否放行仍由安全策略决定。忘记配置放行策略是 NAT Server 不生效的头号原因，因此第四项错误。',
    knowledgeId: 'security-nat', direction: 'security', tag: 'real',
  },
  {
    id: 'ex-sec-014', type: 'multiple', difficulty: 'IP',
    question: '关于 NAT ALG，以下说法正确的有？',
    options: [
      '用于处理应用层协议载荷中携带的 IP 与端口信息',
      'FTP、SIP 等协议通常需要 ALG 支持',
      'ALG 可帮助这些协议正确穿越 NAT',
      'ALG 是一种加密算法',
    ],
    answer: [
      '用于处理应用层协议载荷中携带的 IP 与端口信息',
      'FTP、SIP 等协议通常需要 ALG 支持',
      'ALG 可帮助这些协议正确穿越 NAT',
    ],
    explanation: 'ALG（应用层网关）与加密无关，它负责识别并改写应用层载荷中的地址信息，因此第四项属于概念混淆。',
    knowledgeId: 'security-nat', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-015', type: 'judge', difficulty: 'IP',
    question: '防火墙的 NAT 功能不能替代安全策略，转换后的流量仍需被安全策略允许。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'NAT 与安全策略是两个独立环节，排障时应先确认策略是否放行，再确认 NAT 是否命中。',
    knowledgeId: 'security-nat', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-016', type: 'judge', difficulty: 'IP',
    question: 'Easy-IP 属于 NAPT 的一种实现形式。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'Easy-IP 不单独配置地址池，直接借用出接口地址做端口转换，本质上仍是 NAPT。',
    knowledgeId: 'security-nat', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-017', type: 'judge', difficulty: 'IP',
    question: 'No-PAT 转换方式会同时转换报文的源端口。',
    options: ['正确', '错误'], answer: '错误',
    explanation: 'No-PAT 的特点正是"不转换端口"，仅做 IP 地址的一对一映射，因此一个公网地址只能被一个内网用户占用。',
    knowledgeId: 'security-nat', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-018', type: 'judge', difficulty: 'IP',
    question: '双向 NAT 会同时转换报文的源 IP 与目的 IP。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '双向 NAT 用于特定互通场景（如地址重叠或需同时隐藏两侧），其特点是源与目的同时被改写。',
    knowledgeId: 'security-nat', direction: 'security', tag: 'hot',
  },

  // ==================== security-attack-defense  攻击与防御（核心考点，加码）====================
  {
    id: 'ex-sec-019', type: 'multiple', difficulty: 'IP',
    question: '关于单包攻击，以下说法正确的有？',
    options: [
      'Land 攻击的源 IP 与目的 IP 均为攻击目标本身',
      'Smurf 攻击利用广播地址放大 ICMP 流量',
      'Ping of Death 通过超大 ICMP 报文实现',
      'Teardrop 攻击通过正常分片即可奏效',
    ],
    answer: [
      'Land 攻击的源 IP 与目的 IP 均为攻击目标本身',
      'Smurf 攻击利用广播地址放大 ICMP 流量',
      'Ping of Death 通过超大 ICMP 报文实现',
    ],
    explanation: 'Teardrop 依赖的是**分片偏移重叠**的异常分片，正常分片不会造成问题，因此第四项错误。',
    knowledgeId: 'security-attack-defense', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-020', type: 'multiple', difficulty: 'IP',
    question: '关于泛洪攻击及其防御，以下说法正确的有？',
    options: [
      'SYN Flood 会耗尽目标的半连接队列',
      'UDP Flood 主要通过占用带宽与处理能力造成影响',
      '可通过限制 ICMP 速率缓解 ICMP Flood',
      'SYN Cookie 是针对 SYN Flood 的有效防御手段',
    ],
    answer: [
      'SYN Flood 会耗尽目标的半连接队列',
      'UDP Flood 主要通过占用带宽与处理能力造成影响',
      '可通过限制 ICMP 速率缓解 ICMP Flood',
      'SYN Cookie 是针对 SYN Flood 的有效防御手段',
    ],
    explanation: '四项均正确。SYN Cookie 通过不立即建立半连接、改用加密 Cookie 校验的方式抵御攻击，是经典防御机制。',
    knowledgeId: 'security-attack-defense', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-021', type: 'multiple', difficulty: 'IP',
    question: '关于扫描攻击及其检测，以下说法正确的有？',
    options: [
      '端口扫描常用于探测目标开放的服务',
      'SYN 扫描不完成三次握手即可判断端口状态',
      '防火墙可基于阈值检测识别扫描行为',
      '扫描攻击不会在网络中留下任何痕迹',
    ],
    answer: [
      '端口扫描常用于探测目标开放的服务',
      'SYN 扫描不完成三次握手即可判断端口状态',
      '防火墙可基于阈值检测识别扫描行为',
    ],
    explanation: '扫描会产生大量连接尝试或异常报文，防火墙/IDS 可通过阈值与特征识别，因此"不留痕迹"错误。',
    knowledgeId: 'security-attack-defense', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-022', type: 'judge', difficulty: 'IA',
    question: 'Land 攻击的特征是源 IP 与目的 IP 都是攻击目标本身。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '目标主机收到这样的报文后会与自己建立连接，反复消耗自身资源，是典型的单包攻击。',
    knowledgeId: 'security-attack-defense', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-023', type: 'judge', difficulty: 'IP',
    question: 'Smurf 攻击利用了网络的广播放大效应。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '攻击者伪造源 IP 向广播地址发送 ICMP 请求，大量主机回包全部涌向受害目标，形成流量放大。',
    knowledgeId: 'security-attack-defense', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-024', type: 'judge', difficulty: 'IA',
    question: 'IDS（入侵检测系统）可以主动阻断攻击流量。',
    options: ['正确', '错误'], answer: '错误',
    explanation: 'IDS 旁路部署、只做检测与告警；能够主动阻断的是 IPS（入侵防御系统）。这是两者最核心的区别。',
    knowledgeId: 'security-attack-defense', direction: 'security', tag: 'hot',
  },

  // ==================== security-ipsec  IPSec VPN（核心考点，加码）====================
  {
    id: 'ex-sec-025', type: 'multiple', difficulty: 'IP',
    question: '关于 IPSec 的两种安全协议，以下说法正确的有？',
    options: [
      'AH 提供认证与完整性保护，但不加密',
      'ESP 同时提供加密与认证能力',
      'AH 的协议号为 51，ESP 为 50',
      'AH 能够提供数据加密功能',
    ],
    answer: ['AH 提供认证与完整性保护，但不加密', 'ESP 同时提供加密与认证能力', 'AH 的协议号为 51，ESP 为 50'],
    explanation: 'AH 不提供加密，这让它无法保护数据机密性，因此第四项错误；现网中 ESP 使用更广泛。',
    knowledgeId: 'security-ipsec', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-026', type: 'multiple', difficulty: 'IP',
    question: '关于 IPSec 的两种工作模式，以下说法正确的有？',
    options: [
      '传输模式保护传输层及以上的数据',
      '隧道模式会新增一个外层 IP 首部',
      '站点到站点的 VPN 通常使用隧道模式',
      '传输模式必然新增额外的外层 IP 首部',
    ],
    answer: [
      '传输模式保护传输层及以上的数据',
      '隧道模式会新增一个外层 IP 首部',
      '站点到站点的 VPN 通常使用隧道模式',
    ],
    explanation: '传输模式复用原 IP 首部、不新增外层头，适合主机到主机；新增外层头是隧道模式的特征，因此第四项错误。',
    knowledgeId: 'security-ipsec', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-027', type: 'multiple', difficulty: 'IE',
    question: '关于 IKE 协议，以下说法正确的有？',
    options: [
      'IKE 用于自动协商 SA 与密钥',
      'IKE 基于 UDP 500 端口',
      'NAT-T 场景下改使用 UDP 4500 端口',
      'IKEv1 主模式只需要 3 条消息即可完成',
    ],
    answer: ['IKE 用于自动协商 SA 与密钥', 'IKE 基于 UDP 500 端口', 'NAT-T 场景下改使用 UDP 4500 端口'],
    explanation: 'IKEv1 主模式需要 6 条消息，3 条消息的是野蛮模式，因此第四项错误。两者在身份保护能力上也有差异。',
    knowledgeId: 'security-ipsec', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-028', type: 'judge', difficulty: 'IP',
    question: 'IPSec 的 SA 是单向的，双向通信需要建立两个 SA。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'SA 定义了单向的安全参数（算法、密钥等），因此一次双向通信需要入方向与出方向各一个 SA。',
    knowledgeId: 'security-ipsec', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-029', type: 'judge', difficulty: 'IE',
    question: 'NAT-T 通过将 ESP 报文封装在 UDP 4500 中来解决 NAT 穿越问题。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'NAT 设备通常无法正确处理纯 ESP（协议号 50）报文，加一层 UDP 头后即可正常做地址端口转换。',
    knowledgeId: 'security-ipsec', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-030', type: 'judge', difficulty: 'IP',
    question: 'ESP 只能提供数据加密，不能提供认证。',
    options: ['正确', '错误'], answer: '错误',
    explanation: 'ESP 既可加密也可认证（报文尾部含认证数据字段）；只提供认证而不加密的是 AH。',
    knowledgeId: 'security-ipsec', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-031', type: 'judge', difficulty: 'IE',
    question: 'DPD（死端检测）用于检测 IPSec 对端是否存活。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'DPD 周期性探测对端，超时未响应即认为对端失效并触发 SA 重建或切换，避免流量被黑洞丢弃。',
    knowledgeId: 'security-ipsec', direction: 'security', tag: 'hot',
  },

  // ==================== security-ssl-vpn  SSL VPN ====================
  {
    id: 'ex-sec-032', type: 'multiple', difficulty: 'IP',
    question: '关于 SSL VPN 的优势，以下说法正确的有？',
    options: [
      '通常无需安装客户端，浏览器即可访问',
      '基于 443 端口，容易穿越防火墙与 NAT',
      '支持细粒度的资源访问控制',
      '必须先建立站点到站点的 IPsec 隧道才能使用',
    ],
    answer: ['通常无需安装客户端，浏览器即可访问', '基于 443 端口，容易穿越防火墙与 NAT', '支持细粒度的资源访问控制'],
    explanation: 'SSL VPN 定位于远程用户接入，不依赖 IPsec 站点隧道，因此第四项错误。',
    knowledgeId: 'security-ssl-vpn', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-033', type: 'multiple', difficulty: 'IP',
    question: '关于 SSL VPN 的接入方式，以下说法正确的有？',
    options: [
      'Web 代理方式用于访问 Web 资源',
      '端口转发方式用于访问 TCP 应用',
      '网络扩展方式可实现全网络访问',
      'Web 代理方式可以访问任意 TCP 应用',
    ],
    answer: ['Web 代理方式用于访问 Web 资源', '端口转发方式用于访问 TCP 应用', '网络扩展方式可实现全网络访问'],
    explanation: 'Web 代理仅能改写并代理 Web 类流量，无法承载任意 TCP 应用，因此第四项错误。',
    knowledgeId: 'security-ssl-vpn', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-034', type: 'multiple', difficulty: 'IP',
    question: '关于 IPSec VPN 与 SSL VPN 的对比，以下说法正确的有？',
    options: [
      'IPSec VPN 更适合站点到站点的互联',
      'SSL VPN 更适合远程用户的单点接入',
      'SSL VPN 通常基于 443 端口，穿越性好',
      'IPSec VPN 完全不需要任何客户端或配置',
    ],
    answer: ['IPSec VPN 更适合站点到站点的互联', 'SSL VPN 更适合远程用户的单点接入', 'SSL VPN 通常基于 443 端口，穿越性好'],
    explanation: 'IPSec 需要在两端设备上配置策略/模板与感兴趣流，属于"设备间"方案，因此第四项错误。',
    knowledgeId: 'security-ssl-vpn', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-035', type: 'judge', difficulty: 'IA',
    question: 'SSL VPN 默认使用 443 端口，容易穿越防火墙。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '443 是 HTTPS 端口，几乎不会被防火墙封堵，这也是 SSL VPN 部署门槛低的重要原因。',
    knowledgeId: 'security-ssl-vpn', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-036', type: 'judge', difficulty: 'IP',
    question: 'SSL VPN 的"网络扩展"接入方式需要安装客户端软件。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '网络扩展需要在终端安装客户端并创建虚拟网卡，效果最接近 IPsec，因此是四种接入方式中最重的一种。',
    knowledgeId: 'security-ssl-vpn', direction: 'security', tag: 'hot',
  },

  // ==================== security-ips-ids  IDS/IPS ====================
  {
    id: 'ex-sec-037', type: 'multiple', difficulty: 'IP',
    question: '关于 IDS 与 IPS 的区别，以下说法正确的有？',
    options: [
      'IDS 通常旁路部署，只做检测与告警',
      'IPS 在线部署，可以主动阻断攻击',
      'IPS 可以视为在 IDS 检测能力之上增强了阻断动作',
      'IDS 可以直接丢弃命中的攻击报文',
    ],
    answer: ['IDS 通常旁路部署，只做检测与告警', 'IPS 在线部署，可以主动阻断攻击', 'IPS 可以视为在 IDS 检测能力之上增强了阻断动作'],
    explanation: '旁路部署的 IDS 不在转发路径上，无法丢包，因此第四项错误。',
    knowledgeId: 'security-ips-ids', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-038', type: 'multiple', difficulty: 'IP',
    question: '关于 IPS/IDS 的检测技术，以下说法正确的有？',
    options: [
      '特征匹配准确率高，但无法发现未知攻击',
      '异常检测可以发现未知攻击，但误报率相对较高',
      '协议分析通过解析应用层协议发现异常行为',
      '特征匹配可以检测出所有未知攻击',
    ],
    answer: [
      '特征匹配准确率高，但无法发现未知攻击',
      '异常检测可以发现未知攻击，但误报率相对较高',
      '协议分析通过解析应用层协议发现异常行为',
    ],
    explanation: '特征匹配依赖已知攻击签名，对未知攻击天然失效，因此第四项错误。',
    knowledgeId: 'security-ips-ids', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-039', type: 'multiple', difficulty: 'IP',
    question: '关于 IPS 的响应动作，以下说法正确的有？',
    options: ['告警：仅记录日志', '阻断：丢弃报文或重置连接', '限流：降低攻击流量的处理速率', 'IPS 只能记录日志，无法采取阻断动作'],
    answer: ['告警：仅记录日志', '阻断：丢弃报文或重置连接', '限流：降低攻击流量的处理速率'],
    explanation: 'IPS 的核心价值就在于"边检测边阻断"，因此第四项与 IPS 的定位矛盾。',
    knowledgeId: 'security-ips-ids', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-040', type: 'judge', difficulty: 'IP',
    question: 'WAF 专门用于防护 Web 应用攻击，如 SQL 注入与 XSS。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'WAF 针对 HTTP/HTTPS 层做深度解析，可识别注入、跨站脚本、文件上传等应用层攻击。',
    knowledgeId: 'security-ips-ids', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-041', type: 'judge', difficulty: 'IP',
    question: '基于特征匹配的检测技术可以识别所有未知攻击。',
    options: ['正确', '错误'], answer: '错误',
    explanation: '特征匹配只能发现特征库中已有的攻击；面对未知攻击需要依赖异常检测、沙箱等补充手段。',
    knowledgeId: 'security-ips-ids', direction: 'security', tag: 'hot',
  },

  // ==================== security-antivirus  反病毒与内容过滤 ====================
  {
    id: 'ex-sec-042', type: 'multiple', difficulty: 'IP',
    question: '关于反病毒的检测技术，以下说法正确的有？',
    options: [
      '特征码检测基于已知病毒特征，准确率较高',
      '启发式检测基于行为特征，可发现部分未知病毒',
      '云查杀借助云端特征库提升检测能力',
      '虚拟机检测在沙箱中运行样本以观察其行为',
    ],
    answer: [
      '特征码检测基于已知病毒特征，准确率较高',
      '启发式检测基于行为特征，可发现部分未知病毒',
      '云查杀借助云端特征库提升检测能力',
      '虚拟机检测在沙箱中运行样本以观察其行为',
    ],
    explanation: '四项均正确。工程上通常多种技术叠加使用，以兼顾检出率与误报率。',
    knowledgeId: 'security-antivirus', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-043', type: 'multiple', difficulty: 'IP',
    question: '关于内容过滤相关功能，以下说法正确的有？',
    options: [
      'URL 过滤基于分类库或自定义黑白名单控制网站访问',
      '应用识别可以识别并控制特定应用流量',
      'DLP 用于防止敏感数据外泄',
      '文件过滤无法阻止可执行文件的传输',
    ],
    answer: [
      'URL 过滤基于分类库或自定义黑白名单控制网站访问',
      '应用识别可以识别并控制特定应用流量',
      'DLP 用于防止敏感数据外泄',
    ],
    explanation: '文件过滤正是可以按文件类型禁止 exe、bat 等可执行文件传输，因此第四项错误。',
    knowledgeId: 'security-antivirus', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-044', type: 'judge', difficulty: 'IP',
    question: '特征码检测无法发现未知病毒。',
    options: ['正确', '错误'], answer: '正确',
    explanation: '这是特征码技术的固有局限，也是启发式、沙箱等技术被引入的原因。',
    knowledgeId: 'security-antivirus', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-045', type: 'judge', difficulty: 'IP',
    question: '要对 HTTPS 流量进行内容过滤，通常需要导入证书以解密流量。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'HTTPS 载荷加密，安全设备必须先解密才能做内容级检测，这也是 HTTPS 解密功能存在的意义。',
    knowledgeId: 'security-antivirus', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-046', type: 'judge', difficulty: 'IA',
    question: 'DLP（数据防泄漏）用于防止敏感数据外泄。',
    options: ['正确', '错误'], answer: '正确',
    explanation: 'DLP 可识别身份证号、银行卡号、机密文档指纹等内容，并在传输通道上进行阻断或审计。',
    knowledgeId: 'security-antivirus', direction: 'security', tag: 'hot',
  },
  {
    id: 'ex-sec-047', type: 'judge', difficulty: 'IA',
    question: '反病毒只能部署在终端上，无法部署在网关设备上。',
    options: ['正确', '错误'], answer: '错误',
    explanation: '网关防病毒（部署在出口安全设备上）可以防护全网进入的流量，与终端防病毒是互补关系。',
    knowledgeId: 'security-antivirus', direction: 'security', tag: 'hot',
  },
]
