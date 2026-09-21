/* ============================================================
 * 双休购 · 企业工时数据库（核心25家·媒体核实级）
 * 所有工时政策均来自公开媒体报道/企业公告/招聘平台公示，附来源与日期。
 * 字段：policy 政策类型 | restDays 每周休息天数 | salaryKept 薪资是否不变
 *       status 核实等级(verified已核实/reported媒体报道/partial部分岗位)
 *       domain 官网域名(用于展示真实logo) | careers 官方招聘页
 *       salary 薪资待遇 {level, benefits, note} | products 产品(含细分类sub)
 * 数据整理时间：2026-09-08
 * ============================================================ */

const WEEK_DAYS = ['一', '二', '三', '四', '五', '六', '日'];
// 作息模板：work上班 | rest休息 | half休半天 | wfh居家办公 | flex弹性
const PATTERN_443_WED  = ['work', 'work', 'rest', 'work', 'work', 'rest', 'rest'];
const PATTERN_443_FRI  = ['work', 'work', 'work', 'work', 'rest', 'rest', 'rest'];
const PATTERN_45_WED   = ['work', 'work', 'half', 'work', 'work', 'rest', 'rest'];
const PATTERN_45_FRI   = ['work', 'work', 'work', 'work', 'half', 'rest', 'rest'];
const PATTERN_52       = ['work', 'work', 'work', 'work', 'work', 'rest', 'rest'];
const PATTERN_32_WFH   = ['work', 'work', 'wfh',  'work', 'wfh',  'rest', 'rest'];
const PATTERN_FRI_WFH  = ['work', 'work', 'work', 'work', 'wfh',  'rest', 'rest'];
const PATTERN_FLEX     = ['flex', 'flex', 'flex', 'flex', 'flex', 'rest', 'rest'];

const COMPANIES = [
  /* ---------------- 上四休三 ---------------- */
  {
    id: 'fengxue', name: '苏州峰学蔚来教育科技有限公司', short: '峰学蔚来', initial: '峰', color: '#2F6B4F',
    industry: '教育咨询', city: '苏州', policy: 'four_three', policyLabel: '上四休三', restDays: 3,
    salaryKept: true, since: '2023-06', status: 'verified', pattern: PATTERN_443_WED,
    patternNote: '上二休一、上二休二，周三休息（周三有工作可来但不强制打卡）',
    summary: '张雪峰创立的教育公司，2023年6月宣布实行「上四休三」，工资待遇不变，公司还另设寒暑假，此后升级为每月一次三天小长假。',
    evidence: '中国新闻网 2025-01-03《张雪峰谈"上四休三"：已实行两年》；新浪新闻 2023-06 报道公司回应「薪水不变、长期实施」',
    salary: { level: '行业中上', benefits: ['寒暑假', '每月一次三天小长假', '两年以上员工苏州购房可获公司免息借款', '上四休三薪资不变'], note: '创始人明确表示休息增加但薪资不打折。' },
    careers: 'https://www.zhipin.com/gongsi/ebd5990a3b68199e1nNz3tW4FVM~.html',
    products: [
      { name: '高考志愿填报一对一咨询', cat: '教育服务', sub: '升学规划', desc: '核心服务，由升学规划师团队提供院校专业选择指导', hot: true },
      { name: '《手把手教你报志愿》系列图书', cat: '图书文娱', sub: '教育图书', desc: '志愿填报方法论文艺读物，长期位居电商教育类畅销榜', hot: true },
      { name: '升学规划在线课程', cat: '教育服务', sub: '升学规划', desc: '覆盖选科、强基计划、考研规划的体系化课程' },
      { name: '研学旅行营', cat: '教育服务', sub: '研学营地', desc: '面向中学生的名校名企研学项目' },
      { name: '雪峰甄选直播好物', cat: '电商消费', sub: '直播电商', desc: '直播间带货的图书与日用好物' }
    ]
  },
  {
    id: 'zhousanyexiu', name: '长沙周三也休文化传媒有限公司', short: '周三也休', initial: '休', color: '#3E7CB1',
    industry: '文化传媒 / MCN', city: '长沙', policy: 'four_three', policyLabel: '上四休三', restDays: 3,
    salaryKept: true, since: '2023-05', status: 'verified', pattern: PATTERN_443_WED,
    patternNote: '周三带薪休、绝不补班、弹性上下班、不打卡',
    summary: '国内第一家探索四天工作制的互联网广告与 MCN 机构，2023年5月成立。不打卡、周三固定带薪休，两年团队增至50余人、营收翻十倍。',
    evidence: '湖北日报 2026-04-21《"周三也休"治愈年轻人…大冶95后朱天赐》；此前被多家央媒省媒报道',
    salary: { level: '行业平均', benefits: ['员工月薪稳定在8000-10000元（湖北日报报道）', '每周固定奶茶福利', '足额缴纳社保公积金', '不打卡、可自由布置工位'], note: '创始人理念：人不是赚钱的机器，休息才是创意的氧气。' },
    products: [
      { name: '品牌广告全案策划', cat: '企业服务', sub: '营销服务', desc: '为品牌提供整合营销与创意策划', hot: true },
      { name: '短视频账号代运营', cat: '企业服务', sub: '营销服务', desc: '全平台粉丝近亿的矩阵运营经验输出' },
      { name: 'MCN 达人商务合作', cat: '企业服务', sub: '营销服务', desc: '达人经纪与内容商业化合作' }
    ]
  },
  {
    id: 'tianshiwan', name: '杭州天使湾投资管理股份有限公司', short: '天使湾创投', initial: '天', color: '#8E6C3E',
    industry: '投资管理', city: '杭州', policy: 'four_three', policyLabel: '上四休三', restDays: 3,
    salaryKept: true, since: '2024-01', status: 'verified', pattern: PATTERN_443_FRI,
    patternNote: '周一至周四上班，周五至周日休息',
    summary: '2024年1月1日起执行每周四天工作制。凡周五当日三人及以上组队的休闲活动，公司给予每队每人 200 元补贴，鼓励员工真正去休息。',
    evidence: '企查查 2025-01-02《元旦让打工人实现"上四休三"！多家公司已探索四天工作制》引用公司《关于实施四天工作制的通知》',
    salary: { level: '行业中上', benefits: ['周五组队休闲活动补贴200元/人', '四天工作制薪资不变'], note: '投资机构薪酬以 offer 为准。' },
    products: [
      { name: '早期天使投资', cat: '企业服务', sub: '投资孵化', desc: '面向种子轮、天使轮创业项目的投资', hot: true },
      { name: '创业孵化加速服务', cat: '企业服务', sub: '投资孵化', desc: '为被投企业提供资源对接与成长辅导' }
    ]
  },
  {
    id: 'qianyi', name: '深圳市仟溢视讯科技有限公司', short: '仟溢视讯', initial: '仟', color: '#5B5EA6',
    industry: '视讯科技', city: '深圳', policy: 'four_three', policyLabel: '上四休三', restDays: 3,
    salaryKept: true, since: '2023-11', status: 'verified', pattern: PATTERN_443_WED,
    patternNote: '周末双休之外，每周三带薪休假，工作时间 10:00-16:30',
    summary: '2023年11月20日起实行四天工作制：除法定周末双休外全员每周三带薪休假，不鼓励加班，薪酬及其他福利不变。',
    evidence: '企查查 2025-01-02 汇总报道，引用公司 2023-11-15 发布的四天工作制通知',
    salary: { level: '行业平均', benefits: ['薪酬及其他福利不变', '不鼓励加班', '每天仅6.5小时工时'], note: '公司通知明确薪酬福利不因四天制调整。' },
    products: [
      { name: '视频会议终端设备', cat: '数码电子', sub: '电脑平板', desc: '面向企业会议室的音视频一体终端', hot: true },
      { name: '远程视讯解决方案', cat: '企业服务', sub: '技术服务', desc: '软硬一体的远程协作方案部署' }
    ]
  },
  {
    id: 'jingyuan', name: '四川京元集成电路有限公司', short: '京元集成', initial: '京', color: '#0E7C7B',
    industry: '半导体', city: '四川', policy: 'four_three', policyLabel: '上四休三', restDays: 3,
    salaryKept: true, since: '2026-02', status: 'reported', pattern: PATTERN_443_FRI,
    patternNote: '周五带薪休假 + 周末双休，工资不变',
    summary: '2026年2月起实行「周五带薪休假+周末双休」，工资不变。负责人表示：表面亏了实际赚了——员工效率更高、不轻易离职。',
    evidence: '虎嗅 2026-08-10《上四休三不是福利，是一道经济分裂的分水岭》；新浪财经 2026-07-16 同案例报道',
    salary: { level: '行业平均', benefits: ['工资不变', '离职率显著下降'], note: '负责人：员工效率更高、不轻易离职，实际赚了。' },
    products: [
      { name: '集成电路封装测试服务', cat: '企业服务', sub: '制造代工', desc: '面向芯片设计公司的封测代工', hot: true }
    ]
  },
  {
    id: 'zhongkenongchuang', name: '四川中科农创农业科技有限公司', short: '中科农创', initial: '农', color: '#5C8A3A',
    industry: '农业科技', city: '四川', policy: 'four_three', policyLabel: '上四休三（暑期）', restDays: 3,
    salaryKept: true, since: '2026-07', status: 'reported', pattern: PATTERN_443_FRI,
    patternNote: '7-8月暑期：周一至周四上班，周五至周日连休',
    summary: '2026年7-8月暑期实行「上四休三」，周一至周四上班、周五至周日连休，基本薪资及各项福利待遇不受影响。',
    evidence: '新浪财经 2026-07-16《公司"上四休三"但降工资……网友热议》；虎嗅 2026-08-10',
    salary: { level: '行业平均', benefits: ['基本薪资及各项福利待遇不受影响'], note: '暑期特殊安排，媒体公开报道。' },
    products: [
      { name: '智慧农业技术服务', cat: '企业服务', sub: '技术服务', desc: '农业物联网与种植技术输出', hot: true },
      { name: '绿色农产品', cat: '食品生鲜', sub: '农产品', desc: '基地直供的季节农产品' }
    ]
  },

  /* ---------------- 四天半 ---------------- */
  {
    id: 'leshi', name: '乐视网信息技术（北京）股份有限公司', short: '乐视', initial: '乐', color: '#C0392B',
    industry: '互联网 / 智能硬件', city: '北京', policy: 'four_half', policyLabel: '四天半工作制', restDays: 2.5,
    salaryKept: true, since: '2023-01', status: 'verified', pattern: PATTERN_45_WED, domain: 'le.com',
    patternNote: '每周三弹性半天（考勤为连续5小时，如10:00-15:00）',
    summary: '2023年1月1日起执行每周四天半工作制，不降薪、无996。CEO张巍在全员信《乐视，从来与众不同》中宣布，成为国内首家四天半工作制互联网公司。',
    evidence: '天眼查企业头条转载新浪看点《乐视实行4天半工作制：不降薪无996》，引用乐视 2023-01-03 全员信',
    salary: { level: '行业平均', benefits: ['四天半不降薪', '无996', '研发可准点下班'], note: '全员信承诺薪资福利不因工时缩短而减少。' },
    products: [
      { name: '乐视超级电视', cat: '家用电器', sub: '电视影音', desc: '大屏智能电视，乐视硬件的拳头产品', hot: true },
      { name: '乐视视频 App 会员', cat: '软件应用', sub: '视频影音', desc: '影视内容平台，《甄嬛传》等版权剧版权库' },
      { name: '乐视智能投影', cat: '家用电器', sub: '电视影音', desc: '家用智能投影仪系列' },
      { name: '乐视蓝牙耳机', cat: '数码电子', sub: '耳机音箱', desc: '高性价比音频产品线' }
    ]
  },
  {
    id: 'zibuyu', name: '子不语集团有限公司', short: '子不语', initial: '子', color: '#6C4AB0',
    industry: '跨境电商（港股上市）', city: '杭州', policy: 'four_half', policyLabel: '四天半工作制', restDays: 2.5,
    salaryKept: true, since: '2025-02', status: 'verified', pattern: PATTERN_45_FRI,
    patternNote: '每周4.5天，具体弹性半天安排以公司通知为准',
    summary: '「跨境鞋服第一股」，2022年港交所上市。2025年2月1日起在不降薪、不裁员前提下实施4.5天工作制，为电商行业首家。',
    evidence: '潮新闻（浙江日报）2025-03-13《4.5天工作制落地，浙企"反内卷"动真格了？》；临平融媒体中心 2025-01-13',
    salary: { level: '行业中上', benefits: ['不降薪、不裁员', '2024年净利约1.4-1.6亿元扭亏为盈'], note: 'CEO陈才雄：扭亏为盈的业绩是实行4.5天工作制的底气。' },
    careers: 'https://www.zhipin.com/web/geek/job?query=%E5%AD%90%E4%B8%8D%E8%AF%AD',
    products: [
      { name: '快时尚女装', cat: '服饰运动', sub: '女装', desc: '通过亚马逊、独立站销往欧美的自有品牌女装', hot: true },
      { name: '时尚女鞋', cat: '服饰运动', sub: '女鞋', desc: '跨境起家的核心品类' },
      { name: '运动休闲服饰', cat: '服饰运动', sub: '运动服饰', desc: '近年拓展的第二增长曲线品类' }
    ]
  },
  {
    id: 'dongyi', name: '浙江动一新能源动力科技股份有限公司', short: '动一新能源', initial: '动', color: '#B0713C',
    industry: '新能源制造', city: '宁波', policy: 'four_half', policyLabel: '双休 + 设计岗4.5天', restDays: 2.5,
    salaryKept: true, since: '2025-02', status: 'verified', pattern: PATTERN_52,
    patternNote: '非一线岗位双休；产品、ID 等设计类岗位试行4.5天（周五下午起休）',
    summary: '2025年2月起推动工作制改革：除一线工人外所有岗位双休制，产品、ID 等设计类岗位试行4.5天工作制。',
    evidence: '潮新闻 2025-03-13；澎湃新闻 2025-09-05《浙江多家公司实行4.5天工作制，工资不降》',
    salary: { level: '行业平均', benefits: ['非一线岗位双休', '设计岗试行4.5天'], note: '传统制造业中少见的主动改革案例。' },
    products: [
      { name: '新能源动力电池系统', cat: '数码电子', sub: '储能电源', desc: '面向工商业场景的动力与储能电池', hot: true },
      { name: '便携储能电源', cat: '数码电子', sub: '储能电源', desc: '户外与户用储能产品线' }
    ]
  },

  /* ---------------- 双休标杆 ---------------- */
  {
    id: 'microsoft', name: '微软（中国）有限公司', short: '微软中国', initial: '微', color: '#107C10',
    industry: '软件科技（外企）', city: '北京 / 上海 / 苏州', policy: 'double_rest', policyLabel: '双休 · 955', restDays: 2,
    salaryKept: true, since: '长期执行', status: 'verified', pattern: PATTERN_52, domain: 'microsoft.com',
    careers: 'https://careers.microsoft.com',
    patternNote: '标准双休，10:00-18:00，不打卡、可居家办公，加班极少',
    summary: '「厚道的955，真正的 work life balance」。15天全薪年假+15天全薪病假起，节假日加班按劳动法2-3倍工资。',
    evidence: 'BOSS直聘微软中国公司主页（双休、不加班）；牛客微软员工评价区长期口径一致',
    salary: { level: '领先水平', benefits: ['15天全薪年假+15天全薪病假（最高升至20天）', '6周全薪陪产假', '补充公积金+补充医疗', '全员持股', '节假日加班按2-3倍工资'], note: '员工评价「厚道的955」，业界公认的福利标杆。' },
    products: [
      { name: 'Surface Pro / Laptop', cat: '数码电子', sub: '电脑平板', desc: '二合一笔记本与轻薄本产品线', hot: true },
      { name: 'Xbox Series X|S', cat: '数码电子', sub: '游戏设备', desc: '游戏主机及 Game Pass 订阅' },
      { name: 'Microsoft 365', cat: '软件应用', sub: '办公协作', desc: 'Office 办公套件订阅服务' },
      { name: 'Windows 11', cat: '软件应用', sub: '操作系统', desc: '桌面操作系统' }
    ]
  },
  {
    id: 'ibm', name: '国际商业机器（中国）有限公司', short: 'IBM中国', initial: 'I', color: '#1F4E8C',
    industry: '科技服务（外企）', city: '北京 / 上海 等', policy: 'double_rest', policyLabel: '双休 · 不加班文化', restDays: 2,
    salaryKept: true, since: '长期执行', status: 'verified', pattern: PATTERN_52, domain: 'ibm.com',
    careers: 'https://www.ibm.com/cn-zh/careers',
    patternNote: '双休 + 不加班文化，到点下班，节奏平缓',
    summary: '老牌外企作风：双休与不加班文化深入人心，注重效率而非时长，「到点就能拎包走人」。',
    evidence: '牛客 2026-01 双休企业盘点帖；牛客 IBM 员工评价区',
    salary: { level: '行业中上', benefits: ['带薪年假', '补充商业保险', '弹性办公', '到点下班'], note: '老牌外企福利体系完整。' },
    products: [
      { name: 'watsonx 企业 AI 平台', cat: '软件应用', sub: 'AI应用', desc: '企业级人工智能与数据平台', hot: true },
      { name: '混合云与 Red Hat 服务', cat: '企业服务', sub: '云计算', desc: '企业上云与开源解决方案' },
      { name: '数字化转型咨询', cat: '企业服务', sub: '咨询服务', desc: 'IBM Consulting 咨询服务' }
    ]
  },
  {
    id: 'siemens', name: '西门子（中国）有限公司', short: '西门子', initial: '西', color: '#009999',
    industry: '工业制造（外企）', city: '北京 / 上海 / 西安 等', policy: 'double_rest', policyLabel: '双休天花板', restDays: 2,
    salaryKept: true, since: '长期执行', status: 'verified', pattern: PATTERN_52, domain: 'siemens.com',
    careers: 'https://jobs.siemens.com',
    patternNote: '朝九晚六弹性打卡，正式员工每周可申请2天居家办公',
    summary: '被称为「双休天花板」：外企 WLB 贯彻到底，周末绝不打扰，带薪年假15天起，五险一金按最高比例缴纳。',
    evidence: '牛客西门子员工评价区（2024-2026多条一致评价）；牛客双休企业盘点帖',
    salary: { level: '行业中上', benefits: ['带薪年假15天起', '五险一金按最高比例缴纳', '免费班车', '每周2天居家办公', '圣诞假期'], note: '员工评价：周末绝不找你聊工作，加班都是稀罕事。' },
    products: [
      { name: '西门子冰箱 / 洗衣机', cat: '家用电器', sub: '冰箱洗衣机', desc: '西门子家电（博西家电）冰洗产品线', hot: true },
      { name: '西门子洗碗机', cat: '家用电器', sub: '厨房电器', desc: '国内洗碗机品类头部品牌' },
      { name: '开关插座面板', cat: '家居家装', sub: '开关电气', desc: '西门子家居电气系列' }
    ]
  },
  {
    id: 'bosch', name: '博世（中国）投资有限公司', short: '博世中国', initial: '博', color: '#A6192E',
    industry: '智能制造（外企）', city: '上海 / 苏州 等', policy: 'double_rest', policyLabel: '双休', restDays: 2,
    salaryKept: true, since: '长期执行', status: 'verified', pattern: PATTERN_52, domain: 'bosch.com',
    careers: 'https://careers.bosch.com',
    patternNote: '08:30-17:30，双休',
    summary: '德企标杆：08:30-17:30 标准工时双休，免费班车、补充公积金、带薪年假，工作节奏稳定。',
    evidence: 'BOSS直聘博世中国公司主页公示工时与福利',
    salary: { level: '行业中上', benefits: ['补充公积金', '补充医疗保险', '免费班车', '餐补', '通讯与交通补贴'], note: 'BOSS直聘公司主页公示的工时与福利。' },
    products: [
      { name: '博世电动工具', cat: '家居家装', sub: '五金工具', desc: '专业级电钻、角磨机等工具', hot: true },
      { name: '博世家电', cat: '家用电器', sub: '冰箱洗衣机', desc: '冰箱、洗衣机、厨电产品线' },
      { name: '汽车雨刮 / 火花塞', cat: '汽车出行', sub: '汽车配件', desc: '博世汽车售后配件' }
    ]
  },
  {
    id: 'pg', name: '宝洁（中国）有限公司', short: '宝洁', initial: '宝', color: '#005DAA',
    industry: '快消（外企）', city: '广州 等', policy: 'double_rest', policyLabel: '双休 · 朝九晚六', restDays: 2,
    salaryKept: true, since: '长期执行', status: 'verified', pattern: PATTERN_52, domain: 'pg.com',
    careers: 'https://www.pgcareers.com',
    patternNote: '标准双休 + 朝九晚六，几乎不加班',
    summary: '快消圈的双休标杆：标准双休、朝九晚六、几乎没有加班，带薪假期多，「能双休还能攒假期出去旅游」。',
    evidence: '牛客 2026-01 双休企业盘点帖（快消大厂篇）',
    salary: { level: '领先水平', benefits: ['带薪假期多（求职社区口碑18天年假起）', '补充商业保险', '弹性福利平台'], note: '快消第一梯队薪酬福利。' },
    products: [
      { name: '海飞丝 / 飘柔 / 潘婷', cat: '个护美妆', sub: '洗护发', desc: '洗发水护发产品线', hot: true },
      { name: 'OLAY 玉兰油', cat: '个护美妆', sub: '护肤', desc: '大众护肤线' },
      { name: 'SK-II', cat: '个护美妆', sub: '高端护肤', desc: '高端护肤线（神仙水）' },
      { name: '舒肤佳', cat: '个护美妆', sub: '个护清洁', desc: '香皂与沐浴露' },
      { name: '帮宝适', cat: '母婴亲子', sub: '纸尿裤', desc: '婴儿纸尿裤' },
      { name: '汰渍 / 碧浪', cat: '个护美妆', sub: '纸品家清', desc: '洗衣洗涤产品线' },
      { name: '吉列', cat: '个护美妆', sub: '男士护理', desc: '男士剃须产品' }
    ]
  },
  {
    id: 'dji', name: '深圳市大疆创新科技有限公司', short: '大疆', initial: '疆', color: '#222831',
    industry: '无人机 / 影像科技', city: '深圳', policy: 'double_rest', policyLabel: '双休 · 强制21点下班', restDays: 2,
    salaryKept: true, since: '2025-02（反内卷升级）', status: 'verified', pattern: PATTERN_52, domain: 'dji.com',
    careers: 'https://talent.dji.com',
    patternNote: '标准双休 + 弹性打卡；2025-02-27 起强制21点下班，HR 三轮赶人',
    summary: '标准双休+不提倡无效加班。2025年2月27日起「不准加班」运动：主管与 HR 分三轮赶人，上海办公楼21点准时关灯。',
    evidence: '中国新闻周刊 2025-03-18《赶人下班，打工人不淡定了》；经济观察报相关报道；牛客双休盘点帖',
    salary: { level: '领先水平', benefits: ['年终奖', '每月增发500 GT币（约合500元，可在食堂/内部购物/提现）', '公积金'], note: '媒体报道：强制下班后研发效率反升约15%。' },
    products: [
      { name: 'DJI Mini / Air / Mavic 无人机', cat: '数码电子', sub: '无人机', desc: '消费级航拍无人机系列', hot: true },
      { name: 'Osmo Pocket 3', cat: '数码电子', sub: '影像设备', desc: '口袋云台相机，vlog 爆款' },
      { name: 'Osmo Action 运动相机', cat: '数码电子', sub: '影像设备', desc: '运动场景影像产品线' },
      { name: 'DJI Mic 无线麦克风', cat: '数码电子', sub: '影像设备', desc: '创作者收音设备' },
      { name: 'RS 系列相机稳定器', cat: '数码电子', sub: '影像设备', desc: '专业影像稳定设备' }
    ]
  },
  {
    id: 'midea', name: '美的集团股份有限公司', short: '美的', initial: '美', color: '#0066B3',
    industry: '家电制造', city: '佛山', policy: 'double_rest', policyLabel: '双休 · 强制下班', restDays: 2,
    salaryKept: true, since: '2025-01（六条禁令）', status: 'verified', pattern: PATTERN_52, domain: 'midea.com',
    careers: 'https://careers.midea.com',
    patternNote: '「六条禁令」：严禁下班时间开会、形式主义加班；18:20 后不允许留在公司',
    summary: '2025年初发布《关于简化工作方式的要求》，禁止形式主义加班与下班时间开会，HR 巡楼督促员工离岗，「强制18:20下班」登上热搜。',
    evidence: '中国新闻周刊 2025-03-18；澎湃新闻 2025-09-05；美的集团副总裁赵磊对媒体回应',
    salary: { level: '行业中上', benefits: ['五险一金', '年终奖', '无效会议减少20%（集团数据）'], note: '核心导向：8小时内聚焦有价值的工作，业务需要可申请加班。' },
    products: [
      { name: '美的空调', cat: '家用电器', sub: '空调', desc: '家用空调主力产品线', hot: true },
      { name: '冰箱 / 洗衣机', cat: '家用电器', sub: '冰箱洗衣机', desc: '冰洗品类' },
      { name: '电饭煲 / 微波炉', cat: '家用电器', sub: '厨房电器', desc: '厨房小家电' },
      { name: 'COLMO 高端家电', cat: '家用电器', sub: '空调', desc: '集团旗下高端 AI 科技家电品牌' }
    ]
  },
  {
    id: 'bytedance', name: '北京抖音信息服务有限公司（字节跳动）', short: '字节跳动', initial: '字', color: '#325AB4',
    industry: '互联网', city: '北京 等', policy: 'double_rest', policyLabel: '双休（已取消大小周）', restDays: 2,
    salaryKept: true, since: '2021-08', status: 'verified', pattern: PATTERN_52, domain: 'bytedance.com',
    careers: 'https://jobs.bytedance.com',
    patternNote: '2021年8月起取消大小周，恢复全员双休',
    summary: '2021年8月1日起取消实行多年的「大小周」，恢复标准双休；职能与中台岗位普遍早10晚7、周末不打扰。',
    evidence: '中国新闻周刊 2025-03-18 回顾2021年取消大小周潮；牛客双休盘点帖',
    salary: { level: '领先水平', benefits: ['双休恢复', '加班需申请审批', '免费三餐与下午茶（部分办公区）'], note: '互联网第一梯队薪酬包。' },
    products: [
      { name: '抖音', cat: '软件应用', sub: '视频影音', desc: '短视频平台', hot: true },
      { name: '剪映', cat: '软件应用', sub: '工具', desc: '视频剪辑工具' },
      { name: '飞书', cat: '软件应用', sub: '办公协作', desc: '企业协作办公平台' },
      { name: '今日头条', cat: '软件应用', sub: '阅读资讯', desc: '资讯平台' },
      { name: '番茄小说', cat: '软件应用', sub: '阅读资讯', desc: '免费网文阅读' }
    ]
  },
  {
    id: 'kuaishou', name: '北京快手科技有限公司', short: '快手', initial: '快', color: '#FF4906',
    industry: '互联网', city: '北京', policy: 'double_rest', policyLabel: '双休（已取消大小周）', restDays: 2,
    salaryKept: true, since: '2021-07', status: 'verified', pattern: PATTERN_52, domain: 'kuaishou.com',
    patternNote: '2021年7月起取消大小周，恢复双休',
    summary: '2021年7月起取消大小周，是当年互联网「反加班文化」纠偏潮中最早行动的大厂之一。',
    evidence: '中国新闻周刊 2025-03-18《赶人下班，打工人不淡定了》',
    salary: { level: '领先水平', benefits: ['双休恢复', '周末加班需申请'], note: '互联网第一梯队薪酬。' },
    careers: 'https://www.zhipin.com/web/geek/job?query=%E5%BF%AB%E6%89%8B',
    products: [
      { name: '快手 App', cat: '软件应用', sub: '视频影音', desc: '短视频与直播平台', hot: true },
      { name: '快手电商', cat: '电商消费', sub: '直播电商', desc: '直播电商与货架电商' },
      { name: '快手极速版', cat: '软件应用', sub: '视频影音', desc: '轻量版应用' }
    ]
  },
  {
    id: 'tencent', name: '腾讯科技（深圳）有限公司', short: '腾讯', initial: '腾', color: '#00A870',
    industry: '互联网', city: '深圳', policy: 'double_rest', policyLabel: '双休（部分事业群）', restDays: 2,
    salaryKept: true, since: '2021-06（试点健康日）', status: 'partial', pattern: PATTERN_52, domain: 'tencent.com',
    careers: 'https://careers.tencent.com',
    patternNote: '多数事业群标准双休+弹性打卡；光子等工作室曾试点「周三健康日」18点下班',
    summary: '2021年起对加班文化纠偏：光子工作室试点强制双休与「周三健康日」，多数事业群执行标准双休、周末少打扰。',
    evidence: '中国新闻周刊 2025-03-18；牛客双休盘点帖（注明部分事业群）',
    note: '各事业群作息差异较大，求职时建议以具体部门为准。',
    salary: { level: '领先水平', benefits: ['双休', '部分团队周三健康日18点下班', '安居计划（购房免息借款）'], note: '事业群之间作息与文化差异较大。' },
    products: [
      { name: '微信', cat: '软件应用', sub: '社交', desc: '国民级社交应用', hot: true },
      { name: 'QQ', cat: '软件应用', sub: '社交', desc: '即时通讯平台' },
      { name: '腾讯视频', cat: '软件应用', sub: '视频影音', desc: '长视频平台' },
      { name: '王者荣耀', cat: '游戏娱乐', sub: '手游', desc: 'MOBA 手游' },
      { name: '和平精英', cat: '游戏娱乐', sub: '手游', desc: '战术竞技手游' }
    ]
  },
  {
    id: 'xiaomi', name: '小米科技有限责任公司', short: '小米', initial: '米', color: '#FF6900',
    industry: '智能硬件', city: '北京', policy: 'double_rest', policyLabel: '双休（职能/市场等岗位）', restDays: 2,
    salaryKept: true, since: '长期执行', status: 'partial', pattern: PATTERN_52, domain: 'mi.com',
    careers: 'https://hr.xiaomi.com',
    patternNote: '职能、市场等岗位早9晚6双休；大促期间忙碌后安排补休',
    summary: '双休制度执行较彻底：职能与市场岗位早9晚6、周末不加班，大促忙碌后均有补休。',
    evidence: '牛客 2026-01 双休企业盘点帖（注明岗位差异）',
    note: '研发与部分业务线节奏较快，以具体部门为准。',
    salary: { level: '行业中上', benefits: ['双休', '大促后补休', '员工内购福利'], note: '硬件新零售为主业，岗位间节奏差异明显。' },
    products: [
      { name: '小米手机 / REDMI', cat: '数码电子', sub: '手机', desc: '智能手机产品线', hot: true },
      { name: '小米手环 / 手表', cat: '数码电子', sub: '智能穿戴', desc: '可穿戴设备' },
      { name: '米家智能家居', cat: '家用电器', sub: '清洁电器', desc: '扫地机器人、空气净化器等' },
      { name: '小米 SU7', cat: '汽车出行', sub: '整车', desc: '智能电动汽车' }
    ]
  },
  {
    id: 'haier', name: '海尔集团公司', short: '海尔', initial: '海', color: '#005BAA',
    industry: '家电制造', city: '青岛', policy: 'double_rest', policyLabel: '双休（官方：抵制无效加班）', restDays: 2,
    salaryKept: true, since: '2025-02（网传通知）', status: 'partial', pattern: PATTERN_52, domain: 'haier.com',
    careers: 'https://maker.haier.net',
    patternNote: '网传「全面落实双休制」：周六不到岗、食堂停供、加班需提前一周审批且每天≤3小时',
    summary: '2025年2月网传海尔全面落实双休制。内部人士否认发过该通知，但集团官方回应：「坚决抵制无效加班，反对形式化出勤」。',
    evidence: '中国新闻周刊 2025-03-18（含内部人士否认与集团官方回应）；界面新闻相关报道',
    note: '「全员双休通知」未经官方发文确认，实际作息可能因产业线而异。',
    salary: { level: '行业中上', benefits: ['官方称持续提升员工工作体验'], note: '大型集团各产业线作息不一，以具体岗位为准。' },
    products: [
      { name: '海尔冰箱', cat: '家用电器', sub: '冰箱洗衣机', desc: '全球销量领先的冰箱产品线', hot: true },
      { name: '海尔洗衣机', cat: '家用电器', sub: '冰箱洗衣机', desc: '滚筒与波轮洗衣机' },
      { name: '卡萨帝高端家电', cat: '家用电器', sub: '冰箱洗衣机', desc: '集团旗下高端家电品牌' }
    ]
  },

  /* ---------------- 灵活办公 ---------------- */
  {
    id: 'ctrip', name: '携程集团有限公司', short: '携程', initial: '携', color: '#2577E3',
    industry: '在线旅游', city: '上海', policy: 'flexible', policyLabel: '双休 + 3+2混合办公', restDays: 2,
    salaryKept: true, since: '2022-03', status: 'verified', pattern: PATTERN_32_WFH, domain: 'ctrip.com',
    careers: 'https://careers.ctrip.com',
    patternNote: '每周三、周五可远程办公；2025-09起产研员工申请居家免审批',
    summary: '2022年3月在集团全面推广「3+2」混合工作制，不作薪资调整；2025年9月起产研员工周三、周五居家办公免审批自动通过。创始人梁建章称正探索四天工作制。',
    evidence: '绍兴网转浙工之家 2025-10-15；澎湃新闻 2025-09-05《携程产研员工居家办公无需审批》',
    salary: { level: '行业中上', benefits: ['3+2混合办公不降薪', '员工生育补贴：每孩每年1万元、发至5周岁（2023年推出）', '混合办公免审批'], note: '旅游行业头部薪酬，家庭友好政策业内领先。' },
    products: [
      { name: '机票 / 火车票预订', cat: '本地服务', sub: '机酒预订', desc: '交通票务一站式预订', hot: true },
      { name: '酒店预订', cat: '本地服务', sub: '机酒预订', desc: '海内外酒店民宿' },
      { name: '旅游度假线路', cat: '本地服务', sub: '旅游度假', desc: '跟团游、自由行、定制游' },
      { name: '景点门票', cat: '本地服务', sub: '门票玩乐', desc: '景区门票与玩乐项目' }
    ]
  },
  {
    id: 'qunar', name: '北京趣拿信息技术有限公司（去哪儿网）', short: '去哪儿网', initial: '去', color: '#00A0E9',
    industry: '在线旅游', city: '北京', policy: 'flexible', policyLabel: '双休 + 每周2天灵活办公', restDays: 2,
    salaryKept: true, since: '2024-07', status: 'verified', pattern: PATTERN_32_WFH, domain: 'qunar.com',
    patternNote: '每周三、周五为灵活办公日，可不来公司但需完成工作',
    summary: '2024年7月起每周三、周五设「灵活办公日」，省去通勤时间；2025年春节还宣布提前两天放假，凑成11天长假。',
    evidence: '中国新闻网 2025-01-03《有企业尝试每周设立"灵活办公日"》',
    salary: { level: '行业中上', benefits: ['每周2天灵活办公', '2025春节提前2天放假凑成11天长假'], note: '负责人新年信官宣春节提前放假。' },
    careers: 'https://www.zhipin.com/web/geek/job?query=%E5%8E%BB%E5%93%AA%E5%84%BF%E7%BD%91',
    products: [
      { name: '机票比价预订', cat: '本地服务', sub: '机酒预订', desc: '以性价比著称的机票搜索', hot: true },
      { name: '酒店 / 火车票预订', cat: '本地服务', sub: '机酒预订', desc: '住宿与铁路票务' }
    ]
  },
  {
    id: 'dewu', name: '上海得物信息集团有限公司', short: '得物', initial: '得', color: '#00C8B4',
    industry: '潮流电商', city: '上海', policy: 'flexible', policyLabel: '双休 + 弹性通勤假', restDays: 2,
    salaryKept: true, since: '2025-10', status: 'verified', pattern: PATTERN_FLEX, domain: 'dewu.com',
    patternNote: '每月最多5次「弹性通勤假」，可提前离岗/延迟到岗，不占年假',
    summary: '2025年10月1日起实施「弹性通勤假」：每月最多5次因特殊情况提前离岗或延迟到岗，且不计入年假额度，被员工称为「神仙政策」。',
    evidence: '绍兴网转浙工之家 2025-10-15《上海知名企业推出"弹性通勤假"！每月最多5次》，得物工作人员确认属实',
    salary: { level: '行业中上', benefits: ['弹性通勤假每月最多5次', '不计入年假额度'], note: '明确指向提升工作生活平衡感。' },
    careers: 'https://www.zhipin.com/web/geek/job?query=%E5%BE%97%E7%89%A9',
    products: [
      { name: '潮流球鞋', cat: '服饰运动', sub: '运动鞋', desc: '先鉴别后发货的球鞋交易', hot: true },
      { name: '潮牌服装', cat: '服饰运动', sub: '潮牌', desc: '街头与设计师品牌' },
      { name: '数码 3C', cat: '数码电子', sub: '手机', desc: '鉴别体系延伸到数码品类' },
      { name: '美妆个护', cat: '个护美妆', sub: '彩妆香水', desc: '年轻客群美妆专区' }
    ]
  },
  {
    id: 'nike', name: '耐克体育（中国）有限公司', short: '耐克大中华区', initial: '耐', color: '#111111',
    industry: '运动品牌（外企）', city: '上海', policy: 'flexible', policyLabel: '双休 + 周五居家办公', restDays: 2,
    salaryKept: true, since: '2024-01', status: 'verified', pattern: PATTERN_FRI_WFH, domain: 'nike.com',
    careers: 'https://jobs.nike.com',
    patternNote: '办公室员工周一至周四到岗，周五可选择居家办公',
    summary: '2024年1月8日起办公室员工执行混合工作模式：周一至周四办公室办公、周五可居家。官方特别澄清：此为混合办公而非「上四休三」。',
    evidence: '澎湃新闻 2023-10-23《耐克大中华区否认"上四休三"：混合办公模式》',
    note: '曾被误传为「上四休三」，实际为每周5天工作制+周五居家，收录时已按官方口径修正。',
    salary: { level: '领先水平', benefits: ['周五居家办公', '外企完整福利体系', '员工内购'], note: '薪酬福利不受影响，混合办公为全球试点。' },
    products: [
      { name: 'Nike 跑鞋', cat: '服饰运动', sub: '运动鞋', desc: 'Pegasus、Vomero 等跑鞋系列', hot: true },
      { name: 'Air Jordan / 篮球鞋', cat: '服饰运动', sub: '运动鞋', desc: '篮球与潮流鞋线' },
      { name: '运动服装', cat: '服饰运动', sub: '运动服饰', desc: '训练与运动生活服饰' }
    ]
  }
];

/* 政策类型元数据 */
const POLICY_META = {
  four_three: { label: '上四休三', short: '4休3', rank: 1, color: '#2F6B4F', desc: '每周工作4天、休息3天，且薪资不打折' },
  four_half:  { label: '四天半工作制', short: '4.5天', rank: 2, color: '#4E8D6E', desc: '每周工作4.5天，多出半天自由' },
  double_rest:{ label: '标准双休', short: '双休', rank: 3, color: '#3E7CB1', desc: '严格落实每周双休，且不卷加班' },
  flexible:   { label: '双休+灵活办公', short: '灵活', rank: 4, color: '#C08435', desc: '双休基础上提供居家办公或弹性通勤' }
};

/* 产品主分类 */
const PRODUCT_CATS = ['全部', '数码电子', '家用电器', '软件应用', '服饰运动', '个护美妆', '食品生鲜', '母婴亲子', '家居家装', '汽车出行', '图书文娱', '游戏娱乐', '电商消费', '教育服务', '本地服务', '企业服务'];

/* 法律依据 */
const LEGAL_FACTS = [
  { title: '《劳动法》第三十六条', text: '国家实行劳动者每日工作时间不超过八小时、平均每周工作时间不超过四十四小时的工时制度。' },
  { title: '《劳动法》第三十八条', text: '用人单位应当保证劳动者每周至少休息一日。' },
  { title: '《劳动法》第四十四条', text: '休息日安排工作又不能补休的，支付不低于工资200%的报酬；法定休假日安排工作的，支付不低于300%的报酬。' },
  { title: '《国务院关于职工工作时间的规定》', text: '自1995年5月1日起施行：职工每日工作8小时、每周工作40小时——「双休」是写入行政法规的标准工时。' },
  { title: '《劳动合同法》第三十五条', text: '变更劳动合同（如把上五休二改为上四休三并降薪）须与劳动者协商一致，企业不能单方面降薪。' }
];

/* 行动指南 */
const ACTION_GUIDES = [
  { icon: 'cart', title: '用消费投票', text: '优先购买实行双休、上四休三企业的产品与服务。每一笔订单，都是在为「善待员工」的商业模式投票。' },
  { icon: 'megaphone', title: '搜集与传播', text: '发现身边的双休企业，把它们告诉更多人。本数据库持续收录有据可查的案例，欢迎监督指正。' },
  { icon: 'scale', title: '知法才能维权', text: '每周40小时是法定标准工时。遭遇变相单休、无偿加班时，保留考勤与加班记录，必要时通过劳动仲裁维权。' },
  { icon: 'users', title: '良性循环', text: '双休企业获得消费支持→业绩向好→更多企业跟进→打工人普遍受益。双休不是等来的，是争取来的。' }
];

/* 海外四天工作制试验 */
const GLOBAL_FACTS = [
  { title: '英国四天工作制试验（2022）', text: '61家企业、近2900名员工参与全球最大规模试验：100%工资、80%工时、承诺100%产出。半年后企业营收平均微涨1.4%，病假下降65%，离职率下降57%，92%的企业选择继续。' },
  { title: '微软日本「工作生活选择挑战」（2019）', text: '2019年8月试行周五全休的四天工作制，当月劳动生产率同比提升约40%，打印量减少59%，电力消耗下降23%。' },
  { title: '冰岛公共部门试验（2015-2019）', text: '约2500名公共部门员工缩短工时而薪资不变，结果显示幸福感与健康状况显著提升、多数岗位产出保持或提高，此后冰岛86%的劳动者获得缩短工时权利。' }
];
