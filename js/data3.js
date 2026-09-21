/* ============================================================
 * 双休购 v3 · 增强数据层
 * ① SUB_IMG        细分类 → 真实产品配图（本地 img/products/）
 * ② PRICE_RANGE   各分类价格区间（用于确定性定价）
 * ③ BLACKLIST_EXTRA 反面教材扩充（权威媒体公开报道）
 * ④ JOBS          双休企业在招岗位（应聘入口）
 * ⑤ 商品富化函数  enrichProduct：价格/划线价/销量/评分/评论数
 * 数据整理时间：2026-09-20
 * ============================================================ */

/* ---------- 细分类 → 产品图 ---------- */
const SUB_IMG = {
  '手机': 'img/products/phone.jpg', '电脑平板': 'img/products/laptop.jpg', '无人机': 'img/products/camera.jpg',
  '影像设备': 'img/products/camera.jpg', '耳机音箱': 'img/products/headphones.jpg', '智能穿戴': 'img/products/watch.jpg',
  '游戏设备': 'img/products/game.jpg', '储能电源': 'img/products/evcharge.jpg',
  '空调': 'img/products/tv.jpg', '冰箱洗衣机': 'img/products/tv.jpg', '厨房电器': 'img/products/bread.jpg',
  '清洁电器': 'img/products/drill.jpg', '环境电器': 'img/products/plant.jpg', '电视影音': 'img/products/tv.jpg',
  '社交': 'img/products/network.jpg', '办公协作': 'img/products/office.jpg', '视频影音': 'img/products/tv.jpg',
  '工具': 'img/products/keyboard.jpg', '阅读资讯': 'img/products/book.jpg', '设计创意': 'img/products/art.jpg',
  'AI应用': 'img/products/chip.jpg', '操作系统': 'img/products/laptop.jpg',
  '运动鞋': 'img/products/sneaker.jpg', '运动服饰': 'img/products/running.jpg', '休闲服饰': 'img/products/tshirt.jpg',
  '女装': 'img/products/dress.jpg', '女鞋': 'img/products/shoes.jpg', '潮牌': 'img/products/tshirt.jpg',
  '洗护发': 'img/products/skincare.jpg', '护肤': 'img/products/skincare.jpg', '高端护肤': 'img/products/perfume.jpg',
  '彩妆香水': 'img/products/lipstick.jpg', '个护清洁': 'img/products/medicine.jpg', '男士护理': 'img/products/glasses.jpg',
  '纸品家清': 'img/products/food.jpg',
  '生鲜': 'img/products/fruit.jpg', '乳品饮料': 'img/products/milk.jpg', '零食': 'img/products/food.jpg',
  '粮油调味': 'img/products/oil.jpg', '营养保健': 'img/products/medicine.jpg', '农产品': 'img/products/vegetable.jpg',
  '纸尿裤': 'img/products/baby.jpg', '奶粉辅食': 'img/products/milk.jpg', '婴童用品': 'img/products/baby.jpg',
  '五金工具': 'img/products/drill.jpg', '开关电气': 'img/products/evcharge.jpg', '家具家居': 'img/products/couch.jpg',
  '照明': 'img/products/lamp.jpg',
  '整车': 'img/products/car.jpg', '汽车配件': 'img/products/engine.jpg', '充电补能': 'img/products/evcharge.jpg',
  '教育图书': 'img/products/bookstore.jpg', '大众图书': 'img/products/book.jpg', '文创': 'img/products/art.jpg',
  '手游': 'img/products/game.jpg', '主机游戏': 'img/products/game.jpg', '电竞': 'img/products/keyboard.jpg',
  '潮流玩具': 'img/products/lego.jpg',
  '直播电商': 'img/products/shopping.jpg', '平台服务': 'img/products/shopping.jpg', '跨境好物': 'img/products/delivery.jpg',
  '升学规划': 'img/products/graduation.jpg', '职业培训': 'img/products/teacher.jpg', '研学营地': 'img/products/graduation.jpg',
  '语言培训': 'img/products/language.jpg',
  '机酒预订': 'img/products/hotel.jpg', '旅游度假': 'img/products/flight.jpg', '门票玩乐': 'img/products/beach.jpg',
  '出行打车': 'img/products/car.jpg', '快递物流': 'img/products/delivery.jpg',
  '投资孵化': 'img/products/handshake.jpg', '营销服务': 'img/products/megaphone.jpg', '技术服务': 'img/products/network.jpg',
  '咨询服务': 'img/products/handshake.jpg', '制造代工': 'img/products/robot.jpg', '云计算': 'img/products/network.jpg',
  '硬件设备': 'img/products/chip.jpg', '医药健康': 'img/products/pharma.jpg'
};

/* ---------- 各分类价格区间 ---------- */
const PRICE_RANGE = {
  '数码电子': [299, 8999], '家用电器': [199, 9999], '软件应用': [15, 899],
  '服饰运动': [49, 1599], '个护美妆': [19, 1299], '食品生鲜': [9, 299],
  '母婴亲子': [29, 699], '家居家装': [29, 2999], '汽车出行': [199, 299999],
  '图书文娱': [19, 199], '游戏娱乐': [29, 2999], '电商消费': [29, 1999],
  '教育服务': [99, 9999], '本地服务': [9, 4999], '企业服务': [199, 99999]
};

/* 确定性散列：同一商品每次算出同样的价格/销量/评分 */
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
  return Math.abs(h);
}
/* 取整到「99/199/259」这类好看价位 */
function nicePrice(v) {
  if (v < 50) return Math.round(v / 9) * 9 + 9;
  if (v < 500) return Math.round(v / 49) * 49 + 49;
  if (v < 2000) return Math.round(v / 99) * 99 + 99;
  if (v < 10000) return Math.round(v / 199) * 199 + 199;
  return Math.round(v / 999) * 999 + 999;
}
/* ---------- 商品名关键词 → 精准配图 ---------- */
const KEYWORD_IMG = [
  ['咖啡|coffee|胶囊|雀巢', 'coffee.jpg'],
  ['手机|phone|Galaxy|iPhone|小米|华为|苹果', 'phone.jpg'],
  ['耳机|headphone|降噪|WH-1000', 'headphones.jpg'],
  ['手表|watch|手环|穿戴', 'watch.jpg'],
  ['相机|微单|Alpha|镜头|单反', 'camera.jpg'],
  ['电脑|笔记本|laptop|Surface|平板|tablet', 'laptop.jpg'],
  ['电视|TV|QLED|影音|投影', 'tv.jpg'],
  ['键盘|keyboard|机械', 'keyboard.jpg'],
  ['鼠标|mouse', 'mouse.jpg'],
  ['跑鞋|sneaker|跑步|运动', 'sneaker.jpg'],
  ['连衣裙|女装|dress|裙子', 'dress.jpg'],
  ['T恤|tshirt|UT|摇粒绒|轻羽绒|服饰', 'tshirt.jpg'],
  ['鞋|shoe|靴|凉鞋', 'shoes.jpg'],
  ['护肤|skincare|精华|面霜|水乳|防晒|洁面|小棕瓶|红腰子|安热沙|雅姿|碧柔|大宝|修丽可|海蓝之谜|雅诗兰黛|兰蔻|巴黎欧莱雅|倩碧|怡丽丝尔|资生堂|修丽可', 'skincare.jpg'],
  ['口红|lipstick|彩妆|MAC|魅可|美宝莲|唇|粉底', 'lipstick.jpg'],
  ['香水|perfume|香氛', 'perfume.jpg'],
  ['眼镜|glasses|墨镜', 'glasses.jpg'],
  ['水果|fruit|生鲜|苹果|橙|草莓|葡萄', 'fruit.jpg'],
  ['牛奶|奶粉|乳|酸奶|爱他美|诺优能|优诺|纯悦|依云|脉动|雪碧|芬达|美汁源|可乐|饮料', 'milk.jpg'],
  ['零食|巧克力|饼干|糖|威化|趣多多|奥利奥|士力架|M&M|德芙|炫迈|乐事|薯片|冰淇淋|雪糕|梦龙|可爱多|徐福记|脆脆鲨|和路雪|湾仔码头|哈根达斯|热狗|面包', 'food.jpg'],
  ['面包|烘焙|cake|蛋糕|糕点', 'bread.jpg'],
  ['蛋糕|cake|甜点', 'cake.jpg'],
  ['肉|meat|牛排|火腿', 'meat.jpg'],
  ['蔬菜|vegetable|有机', 'vegetable.jpg'],
  ['油|oil|酱油|调味|番茄酱|亨氏|味事达|橄榄油', 'oil.jpg'],
  ['药|维生素|保健|善存|钙尔奇|芬必得|爱乐维|达喜|舒适达|李施德林|邦迪|创可贴|漱口水|口腔|牙膏|牙刷|洗发|洗护|清扬|多芬|施华蔻|丝蕴|碧柔|滴露|杜蕾斯|薇婷|高洁丝|护舒宝|卫生巾|舒洁|纸巾|洗衣|奥妙|宝莹|洗衣液|洗洁精|柔顺', 'medicine.jpg'],
  ['婴儿|纸尿裤|好奇|妙而舒|强生|宝宝|母婴|奶粉', 'baby.jpg'],
  ['沙发|couch|家具|宜家|家居|收纳|厨房|纺织品', 'couch.jpg'],
  ['椅子|chair|办公椅', 'chair.jpg'],
  ['花|flower|玫瑰|花艺|绿植|盆栽', 'flower.jpg'],
  ['灯|lamp|照明|台灯', 'lamp.jpg'],
  ['工具|drill|五金|电钻|螺丝', 'drill.jpg'],
  ['车|car|汽车|SUV|轿车|海豚|元|ET|ES|理想|小米SU7|蔚来|小鹏|极越', 'car.jpg'],
  ['发动机|engine|电机|变速箱', 'engine.jpg'],
  ['充电|储能|电源|换电|超充|电池', 'evcharge.jpg'],
  ['书|book|阅读|小说|教材|文具|笔|pen|本子|笔记本', 'book.jpg'],
  ['书店|bookstore|书城|图书馆', 'bookstore.jpg'],
  ['乐高|lego|积木|玩具|toy|拼图|手办|潮玩|模型', 'lego.jpg'],
  ['游戏|game|手游|PS5|Steam|主机|电竞|剑网|恋与|暖暖|逆水寒|梦幻西游|蛋仔', 'game.jpg'],
  ['VR|vr|头显|眼镜', 'vr.jpg'],
  ['电商|shopping|直播|平台|跨境|特卖|旗舰店|得物|唯品会|天猫|淘宝|盒马|严选|拼多多', 'shopping.jpg'],
  ['快递|delivery|物流|配送|顺丰|申通|仓储|快递柜', 'delivery.jpg'],
  ['飞机|flight|机票|航空|出差', 'flight.jpg'],
  ['酒店|hotel|民宿|住宿|旅馆', 'hotel.jpg'],
  ['沙滩|beach|度假|旅游|旅行|酒店|景区|门票', 'beach.jpg'],
  ['握手|handshake|咨询|投资|孵化|猎头|招聘', 'handshake.jpg'],
  ['喇叭|megaphone|广告|营销|推广|品牌', 'megaphone.jpg'],
  ['机器人|robot|自动化|机械臂|工业', 'robot.jpg'],
  ['网络|network|交换机|路由|云|AWS|Azure|SAP|Oracle|数据库|服务器|IT|软件|SaaS|企业服务|技术服务|云计算', 'network.jpg'],
  ['办公|office|协作|钉钉|飞书|会议|打印机|投影', 'office.jpg'],
  ['芯片|chip|半导体|处理器|GPU|CPU|固态|存储|显卡', 'chip.jpg'],
  ['麦克风|mic|音频|播客|录音|直播', 'mic.jpg'],
  ['珠宝|jewelry|首饰|项链|戒指|手表', 'jewelry.jpg'],
  ['老师|teacher|培训|教育|课程|学校|研学|STEAM|育儿', 'teacher.jpg'],
  ['毕业|graduation|学位|升学|考研|留学|考试', 'graduation.jpg'],
  ['语言|language|英语|日语|韩语|口语|翻译', 'language.jpg'],
  ['瑜伽|yoga|健身|普拉提|运动|露营|户外', 'yoga.jpg'],
  ['自行车|bicycle|单车|骑行|电动车', 'bicycle.jpg'],
  ['植物|plant|空气|净化|加湿|除湿|风扇|空调|空气净化器', 'plant.jpg'],
  ['建筑|building|房产|工程|房地产|商业地产', 'building.jpg'],
  ['货车|truck|重卡|物流车|挂车', 'truck.jpg'],
  ['茶|tea|普洱|龙井|红茶|绿茶|立顿|奶茶', 'tea.jpg'],
  ['扬声器|speaker|音响|音箱|SoundBar', 'speaker.jpg'],
  ['平板|tablet|iPad|MatePad', 'tablet.jpg'],
  ['艺术|art|设计|插画|文创|周边|手账|贴纸|海报', 'art.jpg'],
  ['母婴|baby|儿童|童装|玩具', 'baby.jpg']
];

/* 富化单个商品：返回价格/划线价/销量/评分/评论数/图 */
function enrichProduct(p) {
  const h = hashStr(p.name + '|' + (p.cid || ''));
  const range = PRICE_RANGE[p.cat] || [29, 999];
  const base = range[0] + (h % (range[1] - range[0]));
  const price = Math.max(9, nicePrice(base));
  const orig = Math.round(price * (1.18 + (h % 50) / 10) * 10) / 10;
  const sales = 300 + (h % 49700);
  const rating = (4.3 + (h % 70) / 100).toFixed(1);
  const reviews = 80 + (h % 4920);
  // 优先按商品名关键词匹配精准图，再按细分类兜底
  let img = 'img/products/shopping.jpg';
  const name = (p.name || '') + ' ' + (p.desc || '');
  for (const [kw, file] of KEYWORD_IMG) {
    if (new RegExp(kw).test(name)) { img = 'img/products/' + file; break; }
  }
  if (img === 'img/products/shopping.jpg') {
    img = SUB_IMG[p.sub] || SUB_IMG[p.cat] || 'img/products/shopping.jpg';
  }
  return { price, origPrice: orig > price ? Math.round(orig) : Math.round(price * 1.3), sales, rating, reviews, img };
}

/* ---------- 反面教材扩充（权威媒体公开报道） ---------- */
const BLACKLIST_EXTRA = [
  bad('bilibili', '上海宽娱数码科技有限公司（哔哩哔哩）', '哔哩哔哩', '#FB7299', '互联网/视频', '上海',
    '审核岗员工除夕加班猝死', 'high', 'past', '2022',
    '2022年2月，哔哩哔哩武汉分公司一名内容审核员工在过年值班期间于出租屋内猝死，年仅25岁。其所在审核组曾被曝「夜班制度」「连续排班」。事件引发社会对互联网审核岗位劳动强度的广泛讨论，B站随后回应将增加人手、优化排班。',
    '内容审核岗常采用夜班/轮班制，舆论质疑其排班强度与健康保障；事件后公司承诺优化。',
    '封面新闻/澎湃新闻 2022-02 报道员工猝死及 B 站回应；多家媒体评论审核岗过劳问题',
    [bp('哔哩哔哩 App / 大会员', '软件应用', '视频影音', '视频平台及付费会员', '可改用：腾讯视频（双休企业内容产品）、乐视视频'),
     bp('哔哩哔哩游戏', '游戏娱乐', '手游', '平台联运与自研游戏', '可改用：米哈游/莉莉丝（游戏圈 WLB 口碑）')]),
  bad('eleme', '上海拉扎斯信息科技有限公司（饿了么）', '饿了么', '#0085FF', '本地生活/外卖', '上海',
    '骑手算法「多等8分钟」争议', 'mid', 'past', '2020',
    '2020年9月，饿了么宣布将上线「我愿意多等5分钟/10分钟」功能，把压缩配送时长的算法压力转嫁给消费者，引发「骑手困在系统里」的广泛讨论。人民日报、新华社等评论指出算法不应以牺牲骑手安全与尊严为代价。',
    '骑手配送时长被算法不断压缩，交通事故风险与差评处罚长期被舆论关注。',
    '人民日报 2020-09 评论；新华社/央视等关于骑手算法的系列报道',
    [bp('饿了么外卖', '本地服务', '门票玩乐', '外卖即时配送', '可改用：美团到店/酒旅等非外卖业务（办公室岗双休）；优先选到店消费')]),
  bad('ximalaya', '上海喜马拉雅科技有限公司', '喜马拉雅', '#FF6600', '互联网/音频', '上海',
    '22岁实习生凌晨加班猝死', 'high', 'past', '2021',
    '2021年8月，一名22岁的喜马拉雅音频社区运营实习生在凌晨加班后于地铁口晕倒，经抢救无效去世。家属称其连续加班。事件再次敲响互联网「007」与实习生过劳的警钟。',
    '舆论质疑实习生加班时长与健康保障；涉事岗位被指长期夜班。',
    '澎湃新闻/红星新闻 2021-08 报道实习生猝死事件及家属陈述',
    [bp('喜马拉雅 App / 会员', '软件应用', '视频影音', '音频平台及付费会员', '可改用：腾讯视频/抖音等双休企业内容产品')]),
  bad('suning', '苏宁易购集团股份有限公司', '苏宁易购', '#FF0000', '零售/家电', '南京',
    '变相裁员 · 拖欠工资', 'high', 'past', '2021-2022',
    '2021年底起，苏宁集团陷入债务危机。多地员工被曝工资缓发、社保公积金断缴、强制转岗或「自愿离职」，大量员工通过劳动仲裁维权。线下门店大规模关闭，供应商欠款累累。',
    '工资缓发、社保断缴、强制签「自愿离职」协议以规避补偿；员工集体仲裁。',
    '第一财经/界面新闻/财新 2021-2022 连续报道苏宁流动性危机与员工欠薪',
    [bp('苏宁易购门店', '电商消费', '平台服务', '家电线下零售（大量闭店）', '可改用：美的/海尔官方商城（双休企业）'),
     bp('苏宁易购 App', '电商消费', '平台服务', '线上家电零售', '同上')]),
  bad('xibei', '西贝餐饮管理有限公司', '西贝莜面村', '#E60012', '餐饮', '北京',
    '疫情期间降薪风波', 'mid', 'past', '2020',
    '2020年疫情初期，西贝董事长公开称「贷款发工资也撑不过3个月」，随后被曝对高管与员工施行降薪，引发关于「困难期成本转嫁员工」的讨论。事件成为疫情期餐饮行业用工争议的代表案例。',
    '疫情期间管理层与员工薪酬调整争议，被指先降员工薪而非共担。',
    '2020-02 多家媒体报道西贝「贷款发工资」言论及后续降薪争议',
    [bp('西贝莜面村', '本地服务', '门票玩乐', '餐饮门店', '可改用：支持本地小餐饮或到店自取，减少对单一大牌依赖')]),
  bad('haidilao', '海底捞国际控股有限公司', '海底捞', '#E60012', '餐饮', '成都/简阳',
    '「啄木鸟计划」大规模关店裁员', 'mid', 'past', '2021',
    '2021年11月，海底捞宣布「啄木鸟计划」：逐步关停300家左右客流量低、经营未达预期的门店，同步裁员。大量门店员工面临调岗或离职，被视为餐饮扩张泡沫破裂后的成本出清。',
    '大规模关店伴随裁员与调岗；门店一线员工受冲击最大。',
    '海底捞 2021-11 公告；财新/界面新闻等报道关店数量与裁员影响',
    [bp('海底捞火锅', '本地服务', '门票玩乐', '连锁火锅门店', '可改用：本地小馆或到店自取')]),
  bad('danke', '紫梧桐（北京）资产管理有限公司（蛋壳公寓）', '蛋壳公寓', '#F5222D', '长租公寓', '北京',
    '爆仓 · 租客被赶 · 员工欠薪', 'high', 'past', '2020',
    '2020年底，蛋壳公寓资金链断裂：房东收不到租金强行收房、租客被赶却还要继续还「租金贷」，同时大量员工被欠薪、被 HR 要求「自愿离职」。事件引发全国性维权与监管介入。',
    '员工被欠薪且被诱导签「自愿离职」规避补偿；租客与房东两空。',
    '新华社/央视新闻/财新 2020-2021 连续报道蛋壳爆仓与多方维权',
    [bp('蛋壳公寓（已爆仓）', '本地服务', '住宿', '长租公寓', '租房请选择资金监管规范的平台，谨慎对待「租金贷」')]),
  bad('haoweilai', '北京世纪好未来教育科技有限公司', '好未来', '#E60012', '教育/教培', '北京',
    '「双减」后大规模裁员', 'mid', 'past', '2021',
    '2021年「双减」政策落地后，以学而思为代表的 K12 学科培训业务大幅收缩，好未来等公司大规模裁员、转型。大量教培从业者一夜失业，行业从狂热急转直下。',
    '业务骤然收缩导致大规模裁员；赔偿方案与转型衔接成为争议点。',
    '2021-2022 财新/第一财经等报道教培行业双减裁员潮',
    [bp('学而思/好未来课程', '教育服务', '升学规划', 'K12 学科培训（已转型）', '可改用：峰学蔚来等合规教育服务；关注素质教育方向')])
];

/* ---------- 双休企业在招岗位（应聘） ---------- */
/* 岗位为示例性质，真实职位以官方招聘页实时为准 */
const JOBS = {
  'leshi': [
    { title: '高级 Android 工程师', salary: '25-45K·14薪', loc: '北京', tags: ['双休', '不打卡', '无996'] },
    { title: '内容运营经理', salary: '18-30K', loc: '北京', tags: ['四天半', '弹性'] }
  ],
  'microsoft': [
    { title: 'Software Engineer 2', salary: '35-60K·16薪', loc: '北京/苏州', tags: ['955', '15天年假', 'WFH'] },
    { title: '产品经理 (PMM)', salary: '30-50K', loc: '上海', tags: ['WLB', '补充医疗'] }
  ],
  'siemens': [
    { title: '电气设计工程师', salary: '18-30K·13薪', loc: '上海', tags: ['双休天花板', '2天WFH', '顶格公积金'] },
    { title: '供应链专员', salary: '12-20K', loc: '西安', tags: ['圣诞假', '班车'] }
  ],
  'dji': [
    { title: '嵌入式固件工程师', salary: '25-45K·14薪', loc: '深圳', tags: ['双休', '21点强制下班', 'GT币'] },
    { title: '影像算法工程师', salary: '35-60K', loc: '深圳', tags: ['双休', '不加班'] }
  ],
  'midea': [
    { title: '结构工程师', salary: '15-25K', loc: '佛山', tags: ['18:20下班', '六条禁令'] },
    { title: '电商运营', salary: '12-22K', loc: '佛山', tags: ['双休', '少开会'] }
  ],
  'bytedance': [
    { title: '后端开发工程师', salary: '30-60K·15薪', loc: '北京', tags: ['双休', '取消大小周', '三餐'] },
    { title: '产品经理', salary: '25-50K', loc: '北京/上海', tags: ['双休', '加班需审批'] }
  ],
  'tencent': [
    { title: '后台开发工程师', salary: '28-55K·16薪', loc: '深圳', tags: ['双休', '安居计划', '弹性'] },
    { title: '游戏策划', salary: '25-45K', loc: '深圳', tags: ['双休', '健康日'] }
  ],
  'xiaomi': [
    { title: '手机系统工程师', salary: '22-40K', loc: '北京', tags: ['双休', '内购福利', '补休'] },
    { title: '市场经理', salary: '18-30K', loc: '北京', tags: ['双休', '早9晚6'] }
  ],
  'ctrip': [
    { title: '前端开发工程师', salary: '20-40K·14薪', loc: '上海', tags: ['3+2混合办公', '生育补贴'] },
    { title: '酒店产品经理', salary: '18-32K', loc: '上海', tags: ['双休', '免审批WFH'] }
  ],
  'dewu': [
    { title: '鉴别师（球鞋）', salary: '10-18K', loc: '上海', tags: ['双休', '弹性通勤假'] },
    { title: '电商风控工程师', salary: '20-35K', loc: '上海', tags: ['双休', '每月5次弹性假'] }
  ],
  'mihoyo': [
    { title: '游戏客户端工程师', salary: '35-70K·16薪', loc: '上海', tags: ['双休', '不卷', '年度旅游'] },
    { title: '原画师', salary: '25-50K', loc: '上海', tags: ['双休', '不打卡'] }
  ],
  'lilith': [
    { title: '游戏服务器工程师', salary: '30-55K', loc: '上海', tags: ['双休', '不打卡', '补充公积金'] }
  ],
  'pg': [
    { title: '管理培训生 (MT)', salary: '25-40K·14薪', loc: '广州', tags: ['朝九晚六', '18天年假'] },
    { title: '品牌经理', salary: '20-35K', loc: '广州', tags: ['双休', '弹性福利'] }
  ],
  'apple': [
    { title: 'Acoustic Engineer', salary: '30-60K·16薪', loc: '上海', tags: ['不打卡', 'RSU', '内购'] },
    { title: '零售专家 (RSS)', salary: '12-20K', loc: '全国', tags: ['排班制', '补充医疗'] }
  ],
  'nvidia': [
    { title: 'CUDA 架构工程师', salary: '45-80K·16薪', loc: '北京/上海', tags: ['顶薪', '季度假', 'RSU'] }
  ],
  'nestle': [
    { title: '食品研发工程师', salary: '15-25K·13薪', loc: '北京', tags: ['双休', '外企福利'] }
  ],
  'loreal': [
    { title: '彩妆产品经理', salary: '18-32K', loc: '上海', tags: ['双休', '弹性', '内购'] }
  ],
  'ikea': [
    { title: '全屋设计师', salary: '10-18K', loc: '上海', tags: ['办公室双休', '员工餐', '门店排班'] }
  ],
  'decathlon': [
    { title: '运动产品经理', salary: '12-22K', loc: '上海', tags: ['双休', '运动津贴', '员工折扣'] }
  ],
  'microsoft_careers': []
};
/* 其他公司：默认生成「去官方招聘页投递」的提示岗位 */
function getJobs(cid) { return JOBS[cid] || []; }
