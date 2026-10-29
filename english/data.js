'use strict';

/* =================================================================
   Учебные материалы. Во всех вариантах ответа ПЕРВЫЙ — правильный,
   порядок перемешивается при показе.
   ================================================================= */

const LEVELS = [
  { code: 'A0', en: 'Starter', ru: 'Начинающий', about: 'Вы только начинаете. Сначала разберём основы: to be, Present Simple и самые нужные слова.' },
  { code: 'A1', en: 'Beginner', ru: 'Начальный', about: 'Понимаете и используете простые фразы о себе и повседневных делах.' },
  { code: 'A2', en: 'Elementary', ru: 'Элементарный', about: 'Справляетесь в простых бытовых ситуациях: магазин, дорога, рассказ о себе и своём дне.' },
  { code: 'B1', en: 'Intermediate', ru: 'Средний', about: 'Справляетесь в большинстве ситуаций в поездке, рассказываете о событиях и планах, понимаете основное в ясной речи.' },
  { code: 'B2', en: 'Upper-Intermediate', ru: 'Выше среднего', about: 'Общаетесь с носителями без особого напряжения, понимаете сложные тексты и умеете аргументировать мнение.' },
  { code: 'C1', en: 'Advanced', ru: 'Продвинутый', about: 'Выражаете мысли свободно и точно, понимаете длинные сложные тексты и скрытый смысл.' },
  { code: 'C2', en: 'Proficiency', ru: 'В совершенстве', about: 'Владеете языком практически как образованный носитель. Дальше — шлифовка стиля и нюансов.' }
];

/* Темы: id, уровень, тип (g — грамматика, v — лексика), название, правило, примеры,
   упражнения с выбором [вопрос, варианты, пояснение] и с вводом [вопрос, допустимые ответы, пояснение]. */
const TOPICS = [
  /* ---------- A1 ---------- */
  {
    id: 'be', lv: 1, kind: 'g', title: 'Глагол to be: am / is / are',
    rule: [
      'В английском в предложении всегда есть глагол. Там, где по-русски его нет («Я врач», «Она дома»), нужен **to be**.',
      '**I am**, **he / she / it is**, **we / you / they are**. Отрицание: am not, **isn\'t**, **aren\'t**.',
      'Вопрос — be выходит на первое место: **Are** you ready? **Is** she at home?',
      'Прошедшее: **was** (I, he, she, it) и **were** (we, you, they).',
      'Возраст, голод, холод — тоже через be: I **am** 30. I**\'m** hungry. It**\'s** cold.'
    ],
    ex: [['I am a teacher.', 'Я учитель.'], ['She isn\'t at home.', 'Её нет дома.'], ['Are they from Israel?', 'Они из Израиля?'], ['We were tired yesterday.', 'Вчера мы устали.']],
    d: [
      ['My brother ___ twenty-five years old.', ['is', 'has', 'are', 'am'], 'Возраст — через to be: He is 25. Не «has».'],
      ['___ you hungry?', ['Are', 'Do', 'Is', 'Have'], 'Hungry — прилагательное, поэтому вопрос строится с be: Are you hungry?'],
      ['I ___ at work yesterday.', ['was', 'were', 'am', 'did'], 'Прошедшее время для I — was.'],
      ['They ___ from Spain, they\'re from Italy.', ['aren\'t', 'isn\'t', 'don\'t', 'not'], 'Отрицание с they: are not = aren\'t.'],
      ['Where ___ my keys?', ['are', 'is', 'am', 'be'], 'Keys — множественное число, значит are.']
    ],
    w: [
      ['We ___ (be) at the cinema last night.', ['were'], 'We + прошедшее время → were.'],
      ['It ___ (be, отрицание) cold today.', ['isn\'t', 'is not'], 'It + отрицание → is not / isn\'t.']
    ]
  },
  {
    id: 'pres_simple', lv: 1, kind: 'g', title: 'Present Simple',
    rule: [
      'Регулярные действия, привычки и факты: I **work**, she **works**.',
      'Для he / she / it добавляем **-s / -es**: works, goes, watches. have → **has**.',
      'Вопрос и отрицание — через **do / does**, а основной глагол без -s: **Does** she **work**? He **doesn\'t like** fish.',
      'Слова-подсказки: always, usually, often, sometimes, never, every day.'
    ],
    ex: [['She works in a bank.', 'Она работает в банке.'], ['Do you speak English?', 'Ты говоришь по-английски?'], ['He doesn\'t drink coffee.', 'Он не пьёт кофе.'], ['We usually get up at seven.', 'Мы обычно встаём в семь.']],
    d: [
      ['My sister ___ in London.', ['lives', 'live', 'is live', 'living'], 'He / she / it → глагол с -s.'],
      ['___ your father speak English?', ['Does', 'Do', 'Is', 'Has'], 'Your father = he, поэтому вопрос с does.'],
      ['He ___ like fish.', ['doesn\'t', 'don\'t', 'isn\'t', 'not'], 'Отрицание для he — doesn\'t + глагол без -s.'],
      ['We ___ to the gym every Monday.', ['go', 'goes', 'are go', 'going'], 'С we глагол без окончания.'],
      ['Water ___ at 100 degrees.', ['boils', 'boil', 'is boil', 'boiling'], 'Факт → Present Simple; water = it → -s.']
    ],
    w: [
      ['She ___ (watch) TV every evening.', ['watches'], 'После -ch добавляем -es: watches.'],
      ['Does he ___ (have) a car?', ['have'], 'После does глагол в начальной форме: have, а не has.']
    ]
  },
  {
    id: 'articles', lv: 1, kind: 'g', title: 'Артикли a / an / the',
    rule: [
      '**a / an** — «какой-то, один из»: предмет упоминается впервые или неважно, какой именно. I have **a** dog.',
      '**an** — перед гласным ЗВУКОМ: an apple, **an hour** (h не читается), но **a university** (звук [ju]).',
      '**the** — конкретный, уже известный или единственный: **The** dog is friendly. **the** sun, **the** sea.',
      'Без артикля: множественное число и неисчисляемые в общем смысле (I like cats. Water is important), большинство стран и городов, приёмы пищи (have breakfast).',
      'Профессия в единственном числе — всегда с a / an: She is **an** engineer.'
    ],
    ex: [['I saw a film. The film was great.', 'Я посмотрел фильм. Фильм был отличный.'], ['She is an engineer.', 'Она инженер.'], ['Can you close the window?', 'Закроешь окно?'], ['I love music.', 'Я люблю музыку.']],
    d: [
      ['My father is ___ engineer.', ['an', 'a', 'the', '— (без артикля)'], 'Профессия — с a / an; engineer начинается с гласного звука → an.'],
      ['I bought a new phone. ___ phone is really fast.', ['The', 'A', 'An', '— (без артикля)'], 'Второе упоминание — уже конкретный телефон → the.'],
      ['She studies at ___ university in Boston.', ['a', 'an', 'the', '— (без артикля)'], 'University читается [ju:], это согласный звук → a.'],
      ['We had ___ breakfast at eight.', ['— (без артикля)', 'a', 'the', 'an'], 'Приёмы пищи обычно без артикля: have breakfast.'],
      ['___ moon looks huge tonight.', ['The', 'A', '— (без артикля)', 'An'], 'Единственный в своём роде предмет → the.'],
      ['I don\'t like ___ coffee.', ['— (без артикля)', 'a', 'the', 'an'], 'Неисчисляемое в общем смысле — без артикля.']
    ],
    w: []
  },
  {
    id: 'there_is', lv: 1, kind: 'g', title: 'There is / There are',
    rule: [
      'Когда сообщаем, что что-то где-то **есть**: **There is** a bank near my house. — Рядом с моим домом есть банк.',
      '**There is** + единственное число или неисчисляемое, **there are** + множественное.',
      'Вопрос: **Is there**…? **Are there**…? Прошедшее: **there was / there were**.',
      'Порядок слов обратный русскому: «В комнате два окна» → There are two windows in the room.'
    ],
    ex: [['There is a cat on the sofa.', 'На диване кошка.'], ['There are many people here.', 'Здесь много людей.'], ['Is there a pharmacy nearby?', 'Здесь есть аптека поблизости?'], ['There was a problem with my order.', 'С моим заказом была проблема.']],
    d: [
      ['___ a lot of traffic this morning.', ['There was', 'There were', 'It was', 'Was'], 'Traffic — неисчисляемое → there was.'],
      ['___ any shops near your hotel?', ['Are there', 'Is there', 'There are', 'Have'], 'Shops — множественное число, вопрос → Are there.'],
      ['There ___ two bedrooms in our flat.', ['are', 'is', 'has', 'have'], 'Two bedrooms — множественное число → are.'],
      ['___ no milk in the fridge.', ['There is', 'There are', 'It is', 'Is'], 'Milk — неисчисляемое → there is.'],
      ['Is there a bus stop near here? — Yes, ___.', ['there is', 'it is', 'is there', 'there are'], 'Краткий ответ: Yes, there is.']
    ],
    w: [
      ['There ___ (be) three people in the queue yesterday.', ['were'], 'Множественное число + прошедшее время → were.']
    ]
  },
  {
    id: 'pronouns', lv: 1, kind: 'g', title: 'Местоимения: I / me / my / mine',
    rule: [
      'Кто делает: **I, you, he, she, it, we, they**.',
      'Кого / кому (после глагола и предлога): **me, you, him, her, it, us, them** — Call **me**. This is for **her**.',
      'Чей (перед существительным): **my, your, his, her, its, our, their** — **my** car.',
      'Чей (без существительного): **mine, yours, his, hers, ours, theirs** — The car is **mine**.',
      '**its** — «его/её» для предметов и животных, **it\'s** = it is. Возвратные: myself, yourself, herself… — I did it **myself**.'
    ],
    ex: [['Can you help me?', 'Можешь мне помочь?'], ['This bag is mine.', 'Эта сумка моя.'], ['Their house is big.', 'Их дом большой.'], ['She did it herself.', 'Она сделала это сама.']],
    d: [
      ['Can you help ___?', ['me', 'I', 'my', 'mine'], 'После глагола — объектная форма: me.'],
      ['This isn\'t your bag. It\'s ___.', ['mine', 'my', 'me', 'I'], 'Без существительного после — mine.'],
      ['The dog is hurt. ___ leg is broken.', ['Its', 'It\'s', 'It', 'Their'], 'Its — притяжательное для it. It\'s = it is.'],
      ['Tom and Anna love ___ new house.', ['their', 'them', 'they', 'theirs'], 'Перед существительным — their.'],
      ['She cut ___ while cooking.', ['herself', 'her', 'hers', 'she'], 'Действие на себя → возвратное herself.']
    ],
    w: [
      ['I gave ___ (they) my phone number.', ['them'], 'После глагола — объектная форма them.']
    ]
  },
  {
    id: 'prep_time', lv: 1, kind: 'g', title: 'Предлоги in / on / at',
    rule: [
      'Время: **at** — точное время (at 7 o\'clock, at night); **on** — дни и даты (on Monday, on 5 May, on my birthday); **in** — месяцы, годы, сезоны, части дня (in July, in 2025, in winter, in the morning).',
      'Без предлога: с this / next / last / every (next week, last year), а также tomorrow, yesterday.',
      'Место: **at** — точка (at the bus stop, at work, at home); **in** — внутри (in the room, in London); **on** — на поверхности (on the table, on the wall).'
    ],
    ex: [['The meeting is on Monday at 10.', 'Встреча в понедельник в 10.'], ['I was born in 1995.', 'Я родился в 1995 году.'], ['She\'s at work.', 'Она на работе.'], ['See you next week!', 'Увидимся на следующей неделе!']],
    d: [
      ['The meeting is ___ Monday.', ['on', 'in', 'at', '— (без предлога)'], 'Дни недели → on.'],
      ['I was born ___ 1995.', ['in', 'on', 'at', '— (без предлога)'], 'Годы → in.'],
      ['See you ___ 6 o\'clock.', ['at', 'in', 'on', '— (без предлога)'], 'Точное время → at.'],
      ['We\'re going to Paris ___ next month.', ['— (без предлога)', 'in', 'on', 'at'], 'С next / last / this предлог не нужен.'],
      ['There\'s a picture ___ the wall.', ['on', 'in', 'at', 'to'], 'На поверхности (на стене) → on.'],
      ['She\'s not here, she\'s ___ work.', ['at', 'in', 'on', 'to'], 'Устойчиво: at work, at home, at school.']
    ],
    w: []
  },
  {
    id: 'vocab_basic', lv: 1, kind: 'v', title: 'Базовая лексика',
    rule: [
      'Учите слова **в контексте**: не просто «hungry — голодный», а целую фразу «I\'m hungry, let\'s eat».',
      'Повторяйте по системе интервалов: через день, через 3 дня, через неделю — раздел «Слова» делает это автоматически.',
      'Произносите вслух и слушайте: кнопка 🔊 у каждого слова.',
      'Каждый день добавляйте 3–5 слов, которые встретили сами, в «Мои слова».'
    ],
    ex: [['Can I pay by card?', 'Можно оплатить картой?'], ['I\'m thirsty.', 'Я хочу пить.'], ['Take an umbrella.', 'Возьми зонт.']],
    d: [
      ['I need to ___ a taxi to the airport.', ['take', 'do', 'make', 'go'], 'Take a taxi / bus / train — «поехать на».'],
      ['Could I have the ___, please? We\'d like to pay.', ['bill', 'menu', 'order', 'receipt'], 'Bill — счёт в ресторане. Receipt — чек, который дают после оплаты.'],
      ['It\'s raining. Take your ___.', ['umbrella', 'glasses', 'gloves', 'wallet'], 'Umbrella — зонт.'],
      ['I\'m ___. Can I have a glass of water?', ['thirsty', 'hungry', 'tired', 'angry'], 'Thirsty — хочется пить.'],
      ['The opposite of «cheap» is ___.', ['expensive', 'cheaper', 'free', 'low'], 'Cheap — дешёвый, expensive — дорогой.'],
      ['My brother\'s daughter is my ___.', ['niece', 'nephew', 'cousin', 'aunt'], 'Niece — племянница, nephew — племянник.']
    ],
    w: []
  },

  /* ---------- A2 ---------- */
  {
    id: 'past_simple', lv: 2, kind: 'g', title: 'Past Simple',
    rule: [
      'Завершённое действие в прошлом, когда указано (или понятно) время: yesterday, last week, in 2010, two days **ago**.',
      'Правильные глаголы + **-ed** (worked, played), неправильные — 2-я форма (go → **went**, see → **saw**, buy → **bought**).',
      'Вопрос и отрицание — через **did**, глагол в начальной форме: **Did** you **see** it? I **didn\'t go**.',
      'Частая ошибка: «Did you went?» — правильно Did you **go**?'
    ],
    ex: [['I visited my parents last weekend.', 'Я навестил родителей в выходные.'], ['She bought a car two months ago.', 'Она купила машину два месяца назад.'], ['Did you sleep well?', 'Ты хорошо спал?'], ['We didn\'t know about it.', 'Мы об этом не знали.']],
    d: [
      ['We ___ to the beach last Saturday.', ['went', 'go', 'have gone', 'goed'], 'Last Saturday → Past Simple; go → went.'],
      ['Did you ___ the news yesterday?', ['hear', 'heard', 'hearing', 'hears'], 'После did — начальная форма глагола.'],
      ['I ___ him at the party.', ['didn\'t see', 'didn\'t saw', 'not saw', 'don\'t saw'], 'Отрицание: didn\'t + начальная форма.'],
      ['She ___ her keys an hour ago.', ['lost', 'losed', 'has lost', 'lose'], 'Ago → Past Simple; lose → lost.'],
      ['When ___ you arrive?', ['did', 'were', 'have', 'do'], 'Вопрос о прошлом с обычным глаголом → did.']
    ],
    w: [
      ['They ___ (buy) a flat last year.', ['bought'], 'buy → bought (неправильный глагол).'],
      ['I ___ (think) about you yesterday.', ['thought'], 'think → thought.']
    ]
  },
  {
    id: 'pres_cont', lv: 2, kind: 'g', title: 'Present Continuous или Present Simple',
    rule: [
      '**Present Continuous** (am / is / are + -ing) — то, что происходит сейчас или в текущий период: I**\'m reading**. She**\'s working** from home this week.',
      '**Present Simple** — привычки и факты: I **read** every evening.',
      'Подсказки: now, at the moment, Look!, Listen! → Continuous; usually, every day, often → Simple.',
      'Глаголы состояния (know, like, want, need, believe, understand, belong) обычно не бывают в Continuous: I **know** (не «I\'m knowing»).',
      'Договорённости на ближайшее будущее — тоже Continuous: What **are** you **doing** tonight?'
    ],
    ex: [['Look! It\'s snowing.', 'Смотри! Идёт снег.'], ['I usually walk to work.', 'Я обычно хожу на работу пешком.'], ['I don\'t understand.', 'Я не понимаю.'], ['We\'re meeting at six.', 'Мы встречаемся в шесть.']],
    d: [
      ['Look! It ___.', ['is snowing', 'snows', 'snowing', 'snowed'], 'Look! — происходит прямо сейчас → Continuous.'],
      ['I ___ what you mean.', ['understand', 'am understanding', 'understanding', 'understands'], 'Understand — глагол состояния, в Continuous не употребляется.'],
      ['She usually ___ to work by bus.', ['goes', 'is going', 'go', 'going'], 'Usually → привычка → Present Simple.'],
      ['Be quiet, the baby ___.', ['is sleeping', 'sleeps', 'sleep', 'slept'], 'В момент речи → is sleeping.'],
      ['What ___ this weekend? Any plans?', ['are you doing', 'do you do', 'you are doing', 'do you doing'], 'Планы на ближайшее будущее — Present Continuous.']
    ],
    w: [
      ['Listen! Someone ___ (knock) at the door.', ['is knocking', '\'s knocking'], 'Listen! → is knocking.']
    ]
  },
  {
    id: 'comparatives', lv: 2, kind: 'g', title: 'Степени сравнения',
    rule: [
      'Короткие прилагательные: **-er / the -est**: cheap → cheaper → the cheapest; big → **bigger**; happy → **happier**.',
      'Длинные: **more / the most**: expensive → more expensive → the most expensive.',
      'Исключения: good → **better** → the best; bad → **worse** → the worst; far → further.',
      'Сравнение — **than**: She is taller **than** me. Равенство — **as … as**: as fast as.'
    ],
    ex: [['This one is cheaper.', 'Этот дешевле.'], ['It\'s the best day of my life.', 'Это лучший день в моей жизни.'], ['He\'s not as tall as his brother.', 'Он не такой высокий, как его брат.']],
    d: [
      ['This hotel is ___ than the one we stayed in last year.', ['better', 'gooder', 'more good', 'best'], 'good → better.'],
      ['It\'s the ___ film I\'ve ever seen.', ['worst', 'baddest', 'worse', 'most bad'], 'bad → the worst.'],
      ['My new job is ___ than my old one.', ['more interesting', 'interestinger', 'most interesting', 'more interestinger'], 'Длинное прилагательное → more.'],
      ['He is not as tall ___ his brother.', ['as', 'than', 'like', 'that'], 'Конструкция as … as.'],
      ['London is ___ than Oxford.', ['bigger', 'biger', 'more big', 'biggest'], 'big → bigger (удвоение согласной).']
    ],
    w: [
      ['Today is ___ (hot) day of the year.', ['the hottest'], 'Превосходная степень: the hottest.']
    ]
  },
  {
    id: 'future', lv: 2, kind: 'g', title: 'Будущее: will / going to',
    rule: [
      '**will** — решение в момент речи, обещание, мнение о будущем: I**\'ll** help you. I think it **will** rain.',
      '**going to** — решение принято заранее, или будущее видно по признакам: I**\'m going to** buy a car. Look at those clouds — it**\'s going to** rain.',
      '**Present Continuous** — договорённости: I**\'m meeting** Tom at 6.',
      'После when / if / before / after / as soon as о будущем — **Present Simple**: I\'ll call you when I **arrive** (не «when I will arrive»).'
    ],
    ex: [['I\'ll get it!', 'Я возьму (отвечу)!'], ['We\'re going to move to Haifa.', 'Мы собираемся переехать в Хайфу.'], ['Call me when you get home.', 'Позвони, когда доберёшься домой.']],
    d: [
      ['The phone is ringing. — I ___ it.', ['\'ll get', '\'m going to get', 'get', 'got'], 'Решение в момент речи → will.'],
      ['We ___ visit our friends next weekend. We booked the tickets yesterday.', ['are going to', 'will', 'go to', 'would'], 'Решение принято заранее → going to.'],
      ['Call me when you ___ home.', ['get', 'will get', 'are getting', 'got'], 'После when в значении будущего — Present Simple.'],
      ['Look at that car! It ___ crash!', ['\'s going to', '\'ll be', 'crashes', 'is crash'], 'Прогноз по явным признакам → going to.'],
      ['I promise I ___ tell anyone.', ['won\'t', 'am not going', 'don\'t', 'not'], 'Обещание → will / won\'t.']
    ],
    w: [
      ['If it rains, we ___ (stay) at home.', ['will stay', '\'ll stay'], 'Будущее в главной части → will stay; после if — Present Simple.']
    ]
  },
  {
    id: 'quantifiers', lv: 2, kind: 'g', title: 'some / any / much / many / a few / a little',
    rule: [
      'Исчисляемые (apples, people) — **many, a few, few**; неисчисляемые (water, money, time, advice, information) — **much, a little, little**. **a lot of** — с любыми.',
      '**some** — в утверждениях и в просьбах / предложениях (Would you like **some** tea?), **any** — в вопросах и отрицаниях (I don\'t have **any** money).',
      '**a few / a little** — «немного» (хватает), **few / little** — «мало» (не хватает).',
      'Advice, information, news, furniture — неисчисляемые: some advice (не «an advice», не «advices»).'
    ],
    ex: [['How much is it?', 'Сколько это стоит?'], ['There aren\'t many people here.', 'Здесь немного людей.'], ['I have a few friends there.', 'У меня там есть несколько друзей.']],
    d: [
      ['How ___ money do you need?', ['much', 'many', 'few', 'a lot'], 'Money — неисчисляемое → much.'],
      ['There aren\'t ___ eggs left.', ['any', 'some', 'much', 'a little'], 'Отрицание → any.'],
      ['Would you like ___ cake?', ['some', 'any', 'many', 'few'], 'Предложение / просьба → some.'],
      ['I have ___ friends in Berlin, so I won\'t be lonely.', ['a few', 'a little', 'few', 'much'], 'Исчисляемые, «несколько» в хорошем смысле → a few.'],
      ['Can you give me ___ advice?', ['some', 'an', 'many', 'a few'], 'Advice — неисчисляемое: some advice.'],
      ['He has very ___ patience.', ['little', 'few', 'many', 'a few'], 'Patience — неисчисляемое, «мало» → little.']
    ],
    w: []
  },
  {
    id: 'modals', lv: 2, kind: 'g', title: 'can / must / have to / should',
    rule: [
      '**can** — умею / могу, разрешение: I can swim. **Can** I sit here?',
      '**should** — совет: You **should** see a doctor.',
      '**must** — сильная необходимость (так считает говорящий), правила; **have to** — необходимость из-за обстоятельств: I **have to** wear a uniform.',
      'Важно: **mustn\'t** — нельзя (запрет), **don\'t have to** — не обязательно.',
      'После модальных (кроме have to) глагол без to: You should **go** (не «should to go»). Прошедшее от must — **had to**.'
    ],
    ex: [['You mustn\'t park here.', 'Здесь нельзя парковаться.'], ['You don\'t have to come.', 'Тебе не обязательно приходить.'], ['You should rest.', 'Тебе стоит отдохнуть.']],
    d: [
      ['You ___ smoke here. It\'s forbidden.', ['mustn\'t', 'don\'t have to', 'needn\'t', 'shouldn\'t to'], 'Запрет → mustn\'t.'],
      ['Tomorrow is Saturday, so I ___ get up early.', ['don\'t have to', 'mustn\'t', 'can\'t', 'haven\'t'], 'Нет необходимости → don\'t have to.'],
      ['You look tired. You ___ go to bed.', ['should', 'should to', 'must to', 'have'], 'Совет → should + глагол без to.'],
      ['___ I use your phone?', ['Can', 'Must', 'Should to', 'Have'], 'Просьба о разрешении → Can I…?'],
      ['She ___ work on Sundays — it\'s in her contract.', ['has to', 'have to', 'must to', 'should to'], 'Обязанность по обстоятельствам; she → has to.']
    ],
    w: [
      ['Yesterday I ___ (have to) stay late at work.', ['had to'], 'Прошедшее от must / have to — had to.']
    ]
  },

  /* ---------- B1 ---------- */
  {
    id: 'pres_perfect', lv: 3, kind: 'g', title: 'Present Perfect или Past Simple',
    rule: [
      '**Present Perfect** (have / has + 3-я форма) — важен результат сейчас, время не указано: I**\'ve lost** my keys (и сейчас их нет).',
      'Опыт за жизнь: **Have** you ever **been** to Japan? Со словами just, already, yet, ever, never, this week, today (период ещё не закончился).',
      '**Past Simple** — когда есть конкретное время в прошлом: yesterday, last year, in 2019, ago, when I was a child.',
      'Нельзя: «I have seen him yesterday» → I **saw** him yesterday. Вопрос с **When** — всегда Past Simple.',
      'После This is the first time — Present Perfect: This is the first time I**\'ve been** here.'
    ],
    ex: [['I\'ve already finished the report.', 'Я уже закончил отчёт.'], ['She has never tried sushi.', 'Она никогда не пробовала суши.'], ['I finished the report an hour ago.', 'Я закончил отчёт час назад.']],
    d: [
      ['I ___ him yesterday at the station.', ['saw', 'have seen', 'have saw', 'had seen'], 'Yesterday — конкретное время → Past Simple.'],
      ['Have you ever ___ to Japan?', ['been', 'went', 'go', 'was'], 'Опыт → Have you ever been…'],
      ['This is the first time I ___ sushi.', ['have eaten', 'eat', 'am eating', 'ate'], 'После This is the first time — Present Perfect.'],
      ['When ___ the email?', ['did you send', 'have you sent', 'you sent', 'had you sent'], 'When спрашивает о моменте в прошлом → Past Simple.'],
      ['She ___ three books so far this year.', ['has read', 'read', 'reads', 'had read'], 'So far this year — период не закончился → Present Perfect.']
    ],
    w: [
      ['We ___ (go) to Rome in 2015.', ['went'], 'In 2015 → Past Simple.'],
      ['I have never ___ (try) Indian food.', ['tried'], '3-я форма: tried.']
    ]
  },
  {
    id: 'pp_cont', lv: 3, kind: 'g', title: 'Present Perfect Continuous, for / since',
    rule: [
      'Действие началось в прошлом и продолжается до сих пор: I**\'ve been learning** English for two years.',
      'Русское «Я живу здесь пять лет» — это НЕ Present Simple: I**\'ve lived** / I**\'ve been living** here for five years.',
      '**for** + период (for two hours, for a week), **since** + момент начала (since 2019, since Monday, since I was a child).',
      'С глаголами состояния (know, have = иметь, be, like) — Present Perfect, не Continuous: I**\'ve known** her since school.',
      'Вопрос: **How long have you been** …?'
    ],
    ex: [['I\'ve been waiting for an hour.', 'Я жду уже час.'], ['We\'ve known each other since 2010.', 'Мы знакомы с 2010 года.'], ['How long have you been living here?', 'Сколько ты здесь живёшь?']],
    d: [
      ['I ___ in this city for five years, and I still love it.', ['have lived', 'live', 'am living', 'was living'], 'Пять лет до сих пор → Present Perfect.'],
      ['She has been working here ___ 2020.', ['since', 'for', 'from', 'during'], 'Момент начала → since.'],
      ['We\'ve been waiting ___ forty minutes!', ['for', 'since', 'during', 'from'], 'Период → for.'],
      ['How long ___ English?', ['have you been learning', 'are you learning', 'do you learn', 'you learn'], 'How long + до сих пор → Present Perfect Continuous.'],
      ['I ___ him since we were at school.', ['have known', 'have been knowing', 'know', 'am knowing'], 'Know — глагол состояния → Present Perfect.']
    ],
    w: [
      ['Your eyes are red. Have you been ___ (cry)?', ['crying'], 'Have been + -ing.']
    ]
  },
  {
    id: 'past_cont', lv: 3, kind: 'g', title: 'Past Continuous',
    rule: [
      '**was / were + -ing** — действие было в процессе в определённый момент прошлого: At 8 p.m. I **was having** dinner.',
      'Часто вместе с Past Simple: длинное действие прерывается коротким: I **was cooking** when the phone **rang**.',
      '**While** + длительное действие: While I **was walking**, it started to rain.'
    ],
    ex: [['I was sleeping when you called.', 'Я спал, когда ты позвонил.'], ['What were you doing at 10?', 'Что ты делал в 10?']],
    d: [
      ['I ___ a shower when the phone rang.', ['was taking', 'took', 'am taking', 'have taken'], 'Длительное действие, прерванное другим → Past Continuous.'],
      ['At 10 o\'clock last night I ___ TV, so I didn\'t hear you knock.', ['was watching', 'watched', 'am watching', 'have watched'], 'Процесс в конкретный момент прошлого → Past Continuous.'],
      ['While she ___, she cut her finger.', ['was cooking', 'cooked', 'cooks', 'has cooked'], 'While + процесс → Past Continuous.'],
      ['When I arrived, they ___ dinner, so I joined them.', ['were having', 'had', 'have had', 'are having'], 'Ужин уже шёл в момент моего прихода → were having.'],
      ['Sorry, I didn\'t answer — I ___.', ['was driving', 'drove', 'drive', 'have driven'], 'Был в процессе, когда звонили → was driving.']
    ],
    w: [
      ['They ___ (play) football when it started to rain.', ['were playing'], 'They → were + -ing.']
    ]
  },
  {
    id: 'cond_1_2', lv: 3, kind: 'g', title: 'Условные предложения: 1-й и 2-й тип',
    rule: [
      '**1-й тип** — реальное будущее: If + Present Simple, **will** + глагол. If it **rains**, we**\'ll stay** at home.',
      '**2-й тип** — нереальное или маловероятное сейчас / в будущем: If + Past Simple, **would** + глагол. If I **had** more money, I **would travel** more. (Сейчас денег нет.)',
      'Во 2-м типе с be часто **were** для всех лиц: If I **were** you, I\'d…',
      'Главное правило: после if не ставим will / would.'
    ],
    ex: [['If you call me, I\'ll come.', 'Если позвонишь, я приду.'], ['If I were you, I\'d take it.', 'На твоём месте я бы согласился.']],
    d: [
      ['If I ___ you, I would accept the offer.', ['were', 'am', 'will be', 'would be'], 'If I were you — 2-й тип.'],
      ['If it ___ tomorrow, we\'ll cancel the picnic.', ['rains', 'will rain', 'would rain', 'rained'], '1-й тип: после if — Present Simple.'],
      ['If I had a car, I ___ you to the airport.', ['would drive', 'will drive', 'drove', 'drive'], '2-й тип: would + глагол.'],
      ['What would you do if you ___ a million dollars?', ['won', 'win', 'will win', 'would win'], '2-й тип: if + Past Simple.'],
      ['I\'ll call you if I ___ any news.', ['get', 'will get', 'would get', 'got'], '1-й тип: после if — Present Simple.']
    ],
    w: [
      ['If she ___ (study) harder, she would pass the exam.', ['studied'], '2-й тип: if + Past Simple.']
    ]
  },
  {
    id: 'passive', lv: 3, kind: 'g', title: 'Пассивный залог',
    rule: [
      'Когда важно действие, а не кто его совершил: **be + 3-я форма**.',
      'Present: English **is spoken** here. Past: The bridge **was built** in 1900. Present Perfect: My bike **has been stolen**.',
      'Будущее и модальные: It **will be done** tomorrow. It **must be signed**.',
      'Кто сделал — через **by**: The book was written **by** Orwell.'
    ],
    ex: [['The room is cleaned every day.', 'Комнату убирают каждый день.'], ['My car was repaired yesterday.', 'Мою машину вчера починили.']],
    d: [
      ['This house ___ in 1920.', ['was built', 'built', 'is building', 'has built'], 'Дом построили (кто — неважно) → was built.'],
      ['English ___ all over the world.', ['is spoken', 'speaks', 'is speaking', 'spoken'], 'Present Simple Passive: is spoken.'],
      ['My wallet ___! I can\'t find it anywhere.', ['has been stolen', 'has stolen', 'was stealing', 'stole'], 'Результат важен сейчас → Present Perfect Passive.'],
      ['The results will ___ next week.', ['be announced', 'announced', 'announce', 'being announced'], 'После will — be + 3-я форма.'],
      ['The Mona Lisa was painted ___ Leonardo da Vinci.', ['by', 'from', 'with', 'of'], 'Исполнитель действия — by.']
    ],
    w: [
      ['The letters ___ (send) yesterday.', ['were sent'], 'Множественное число, прошедшее → were sent.']
    ]
  },
  {
    id: 'gerund_inf', lv: 3, kind: 'g', title: 'Герундий или инфинитив',
    rule: [
      'После одних глаголов — **-ing**: enjoy, avoid, finish, mind, suggest, keep, consider, can\'t stand, practise.',
      'После других — **to + глагол**: want, decide, hope, plan, agree, refuse, promise, need, afford, manage.',
      'После предлогов — всегда **-ing**: interested in learning, good at cooking, before leaving, **look forward to seeing**.',
      'Меняют смысл: **stop doing** (перестать) / stop to do (остановиться, чтобы); **remember doing** (помнить, что делал) / **remember to do** (не забыть сделать).'
    ],
    ex: [['I enjoy cooking.', 'Мне нравится готовить.'], ['We decided to stay.', 'Мы решили остаться.'], ['I look forward to hearing from you.', 'Жду вашего ответа.']],
    d: [
      ['I enjoy ___ in the mountains.', ['walking', 'to walk', 'walk', 'walked'], 'enjoy + -ing.'],
      ['We decided ___ a new car.', ['to buy', 'buying', 'buy', 'bought'], 'decide + to.'],
      ['I\'m looking forward to ___ you.', ['seeing', 'see', 'to see', 'saw'], 'В look forward to частица to — это предлог → -ing.'],
      ['Please remember ___ the door when you leave.', ['to lock', 'locking', 'lock', 'locked'], 'Не забыть сделать → remember to do.'],
      ['He stopped ___ two years ago and feels much better.', ['smoking', 'to smoke', 'smoke', 'smoked'], 'Перестал курить → stop doing.'],
      ['She is very good at ___ to people.', ['listening', 'listen', 'to listen', 'listened'], 'После предлога at → -ing.']
    ],
    w: [
      ['Would you mind ___ (open) the window?', ['opening'], 'mind + -ing.']
    ]
  },
  {
    id: 'used_to', lv: 3, kind: 'g', title: 'used to / be used to / get used to',
    rule: [
      '**used to + глагол** — привычка или состояние в прошлом, которых больше нет: I **used to smoke** (раньше курил).',
      'Вопрос и отрицание: **Did** you **use to**…? I **didn\'t use to**…',
      '**be used to + -ing / существительное** — «привык» (сейчас): I**\'m used to getting** up early.',
      '**get used to + -ing** — «привыкать»: I\'m **getting used to living** alone.'
    ],
    ex: [['I used to live in Moscow.', 'Раньше я жил в Москве.'], ['I\'m used to the heat.', 'Я привык к жаре.']],
    d: [
      ['When I was a child, I ___ climb trees.', ['used to', 'was used to', 'use to', 'am used to'], 'Привычка в прошлом → used to.'],
      ['I\'m a nurse, so I\'m used to ___ at night.', ['working', 'work', 'worked', 'have worked'], 'be used to + -ing.'],
      ['Did you ___ have long hair?', ['use to', 'used to', 'using to', 'uses to'], 'После did — use to (без -d).'],
      ['It took me months to get used to ___ on the left.', ['driving', 'drive', 'drove', 'be driving'], 'get used to + -ing.'],
      ['There ___ be a cinema here, but now it\'s a supermarket.', ['used to', 'was used to', 'uses to', 'is used to'], 'Состояние в прошлом → used to.']
    ],
    w: []
  },
  {
    id: 'relative', lv: 3, kind: 'g', title: 'who / which / that / where / whose',
    rule: [
      '**who** — о людях, **which** — о предметах и животных, **that** — о людях и предметах (без запятых), **where** — о месте, **whose** — «чей».',
      'The man **who** lives next door… The phone **that** I bought… The city **where** I was born… The woman **whose** car was stolen…',
      'Если who / which / that — дополнение, его можно опустить: The film (that) we watched was boring.',
      'После запятой (дополнительная информация) **that нельзя**: My brother, **who** lives in Haifa, …',
      '**what** не используется после существительного: the book **that** (не «the book what»).'
    ],
    ex: [['The girl who called you is my sister.', 'Девушка, которая тебе звонила, — моя сестра.'], ['This is the café where we met.', 'Это кафе, где мы познакомились.']],
    d: [
      ['The woman ___ lives next door is a doctor.', ['who', 'which', 'where', 'whose'], 'О человеке → who.'],
      ['This is the restaurant ___ we had our first date.', ['where', 'which', 'who', 'what'], 'Место → where.'],
      ['I have a friend ___ father is a famous actor.', ['whose', 'who', 'who\'s', 'which'], '«Чей» → whose.'],
      ['The book ___ you gave me is fantastic.', ['that', 'what', 'who', 'where'], 'О предмете → that / which; what здесь нельзя.'],
      ['My sister, ___ lives in Canada, is visiting us.', ['who', 'that', 'which', 'whose'], 'После запятой that нельзя; о человеке → who.']
    ],
    w: []
  },
  {
    id: 'reported', lv: 3, kind: 'g', title: 'Косвенная речь',
    rule: [
      'Когда пересказываем слова в прошлом (said, told), время «сдвигается назад»: am → **was**, Present Simple → Past Simple, will → **would**, can → **could**, Past Simple / Present Perfect → **Past Perfect**.',
      '"I\'m tired," she said → She said (that) she **was** tired.',
      '**say** something (to someone), но **tell someone** something: He **told me** the truth.',
      'Вопросы — прямой порядок слов, без do: "Where do you live?" → She asked me where **I lived**.',
      'Вопросы «да / нет» — через **if / whether**: He asked **if** I was ready.'
    ],
    ex: [['He said he was busy.', 'Он сказал, что занят.'], ['She told me she would call.', 'Она сказала мне, что позвонит.'], ['They asked if we were hungry.', 'Они спросили, голодны ли мы.']],
    d: [
      ['He ___ me that he would be late.', ['told', 'said', 'spoke', 'talked'], 'Сказать кому-то → told me (said me — ошибка).'],
      ['She asked me where ___.', ['I lived', 'did I live', 'do I live', 'I do live'], 'В косвенном вопросе — прямой порядок слов.'],
      ['Tom said he ___ help us the next day.', ['would', 'will', 'shall', 'is going'], 'will → would при пересказе.'],
      ['They asked ___ we were hungry.', ['if', 'that', 'what', 'do'], 'Вопрос «да / нет» → if / whether.'],
      ['"I have finished," she said. → She said she ___.', ['had finished', 'has finished', 'finishes', 'is finishing'], 'Present Perfect → Past Perfect при пересказе.']
    ],
    w: []
  },
  {
    id: 'confusing', lv: 3, kind: 'v', title: 'Путаемые слова',
    rule: [
      '**say** (сказать что-то) / **tell** (сказать кому-то, рассказать): say hello, **tell me** the truth.',
      '**make** (создавать) / **do** (выполнять): make a mistake, make a decision, make money; do homework, do the shopping, do business.',
      '**borrow** (взять в долг) / **lend** (дать в долг). **lose** (потерять) / **miss** (пропустить, опоздать на, скучать): miss the bus.',
      '**rob** (ограбить кого-то / место) / **steal** (украсть что-то). **fun** (весёлый — о занятии) / **funny** (смешной).',
      '**bring** (принести сюда) / **take** (отнести, взять с собой туда).'
    ],
    ex: [['Can you lend me your car?', 'Одолжишь мне машину?'], ['I made a mistake.', 'Я ошибся.'], ['Don\'t miss the bus!', 'Не опоздай на автобус!']],
    d: [
      ['Can you ___ me some money until Friday?', ['lend', 'borrow', 'give back', 'owe'], 'Дать в долг → lend.'],
      ['I\'m sorry, I ___ a mistake.', ['made', 'did', 'took', 'had'], 'Make a mistake.'],
      ['She ___ me a funny story.', ['told', 'said', 'spoke', 'talked'], 'Рассказать кому-то историю → tell.'],
      ['Hurry up or we\'ll ___ the train!', ['miss', 'lose', 'lost', 'pass'], 'Опоздать на транспорт → miss.'],
      ['Two men ___ the bank yesterday.', ['robbed', 'stole', 'took', 'borrowed'], 'Ограбить место → rob.'],
      ['I have to ___ my homework tonight.', ['do', 'make', 'have', 'take'], 'Do homework.']
    ],
    w: []
  },

  /* ---------- B2 ---------- */
  {
    id: 'past_perfect', lv: 4, kind: 'g', title: 'Past Perfect',
    rule: [
      '**had + 3-я форма** — действие произошло раньше другого действия в прошлом: When I arrived, the film **had** already **started** (сначала начался фильм, потом пришёл я).',
      'Сравните: When I arrived, the film **started** — фильм начался в момент моего прихода.',
      'Часто с already, just, before, by the time, after.',
      '**Past Perfect Continuous** (had been + -ing) — длительность до момента в прошлом: She was tired because she **had been working** all day.'
    ],
    ex: [['The train had left when we arrived.', 'Поезд уже ушёл, когда мы приехали.'], ['I had never seen the sea before.', 'До этого я никогда не видел моря.']],
    d: [
      ['When we got to the station, the train ___.', ['had already left', 'has already left', 'already leaves', 'was leaving already'], 'Поезд ушёл раньше, чем мы пришли → Past Perfect.'],
      ['I didn\'t recognise him because he ___ a beard.', ['had grown', 'grew', 'has grown', 'was growing'], 'Отрастил бороду раньше момента встречи → had grown.'],
      ['By the time she was 20, she ___ three countries.', ['had lived in', 'lived in', 'has lived in', 'was living in'], 'By the time + прошлое → Past Perfect.'],
      ['He was out of breath because he ___.', ['had been running', 'has been running', 'ran', 'runs'], 'Длительное действие до момента в прошлом → had been running.'],
      ['After they ___ dinner, they went for a walk.', ['had had', 'have had', 'were having', 'has had'], 'Сначала поужинали, потом пошли гулять → had had.']
    ],
    w: [
      ['I had never ___ (see) such a beautiful place before that trip.', ['seen'], 'Past Perfect: had + 3-я форма (seen).']
    ]
  },
  {
    id: 'cond_3', lv: 4, kind: 'g', title: 'Условные предложения 3-го типа',
    rule: [
      'Нереальное прошлое, сожаление о том, что уже случилось: If + **Past Perfect**, **would have + 3-я форма**.',
      'If I **had known**, I **would have helped**. (Я не знал и не помог.)',
      'Вместо would можно **could / might have**.',
      'Сокращения: I**\'d have** = I would have; If I**\'d known** = If I had known. «If I would have known» — ошибка.'
    ],
    ex: [['If I\'d known, I would have come.', 'Если бы я знал, я бы пришёл.'], ['We could have won if we had tried harder.', 'Мы могли бы выиграть, если бы постарались.']],
    d: [
      ['If I had known about the party, I ___.', ['would have come', 'would come', 'will come', 'had come'], '3-й тип: would have + 3-я форма.'],
      ['If you ___ the alarm, you wouldn\'t have been late.', ['had set', 'would set', 'have set', 'would have set'], 'После if в 3-м типе — Past Perfect.'],
      ['She ___ the exam if she had studied more.', ['might have passed', 'might pass', 'passed', 'will pass'], 'Результат в прошлом → might have passed.'],
      ['We would have missed the flight if the taxi ___ late.', ['had been', 'was', 'would be', 'has been'], 'If + Past Perfect.'],
      ['If it ___ so cold, we would have gone swimming.', ['hadn\'t been', 'wasn\'t', 'wouldn\'t be', 'isn\'t'], 'If + Past Perfect (hadn\'t been).']
    ],
    w: []
  },
  {
    id: 'modal_perfect', lv: 4, kind: 'g', title: 'must have / can\'t have / should have',
    rule: [
      'Модальный глагол + **have + 3-я форма** — о прошлом.',
      'Уверенность: **must have done** (наверняка сделал), **can\'t / couldn\'t have done** (не может быть, чтобы сделал).',
      'Возможность: **might / may / could have done** (возможно, сделал).',
      'Упрёк, сожаление: **should have done** (следовало, но не сделал), **shouldn\'t have done** (не стоило).',
      '**needn\'t have done** — сделал, но это было не нужно.'
    ],
    ex: [['She must have forgotten.', 'Она, должно быть, забыла.'], ['You should have told me.', 'Тебе следовало мне сказать.']],
    d: [
      ['The streets are wet. It ___ during the night.', ['must have rained', 'must rain', 'should have rained', 'can\'t have rained'], 'Уверенный вывод о прошлом → must have.'],
      ['She ___ the message — she\'s been offline all day.', ['can\'t have read', 'must have read', 'should have read', 'mustn\'t read'], 'Невозможно, чтобы прочитала → can\'t have.'],
      ['You ___ me you were coming! I would have cooked something.', ['should have told', 'must have told', 'could tell', 'should tell'], 'Упрёк о прошлом → should have.'],
      ['I\'m not sure where my phone is. I ___ it in the taxi.', ['might have left', 'must leave', 'should have left', 'can\'t have left'], 'Не уверен → might have.'],
      ['We ___ so much food — half of it is still in the fridge.', ['needn\'t have bought', 'mustn\'t have bought', 'can\'t have bought', 'didn\'t need buy'], 'Купили, но это было не нужно → needn\'t have.']
    ],
    w: []
  },
  {
    id: 'wish', lv: 4, kind: 'g', title: 'I wish / If only',
    rule: [
      'Сожаление о настоящем: wish + **Past Simple**: I wish I **had** more time (жаль, что времени нет). I wish I **were** taller.',
      'Сожаление о прошлом: wish + **Past Perfect**: I wish I **hadn\'t said** that (жаль, что я это сказал).',
      'Раздражение, желание, чтобы другой изменил поведение: wish + **would**: I wish you **would** stop talking.',
      '**If only** — то же самое, но эмоциональнее.'
    ],
    ex: [['I wish I knew the answer.', 'Жаль, что я не знаю ответа.'], ['I wish I had listened to you.', 'Жаль, что я тебя не послушал.']],
    d: [
      ['I wish I ___ how to drive.', ['knew', 'know', 'will know', 'have known'], 'О настоящем → Past Simple.'],
      ['I wish I ___ so much yesterday. I feel terrible.', ['hadn\'t eaten', 'didn\'t eat', 'haven\'t eaten', 'wouldn\'t eat'], 'О прошлом → Past Perfect.'],
      ['I wish my neighbours ___ so much noise.', ['wouldn\'t make', 'don\'t make', 'haven\'t made', 'won\'t make'], 'Раздражение поведением других → wouldn\'t.'],
      ['If only I ___ more money, I could buy that flat.', ['had', 'have', 'would have', 'will have'], 'О настоящем → Past Simple.'],
      ['She wishes she ___ that job offer last year.', ['had accepted', 'accepted', 'would accept', 'has accepted'], 'О прошлом → Past Perfect.']
    ],
    w: []
  },
  {
    id: 'linking', lv: 4, kind: 'g', title: 'although / despite / however / unless',
    rule: [
      '**although / even though** + подлежащее и глагол: **Although** it was raining, we went out.',
      '**despite / in spite of** + существительное или -ing: **Despite** the rain… **Despite** feeling tired… («despite of» — ошибка!)',
      '**However,** — «однако», обычно в начале нового предложения, после него запятая.',
      '**unless** = if not: I won\'t go **unless** you come with me.',
      '**as long as / provided that** — «при условии, что»; **in case** — «на случай, если»; **whereas** — «тогда как».'
    ],
    ex: [['Despite the price, we bought it.', 'Несмотря на цену, мы это купили.'], ['Take a jacket in case it gets cold.', 'Возьми куртку на случай, если похолодает.']],
    d: [
      ['___ the bad weather, the flight left on time.', ['Despite', 'Although', 'However', 'Despite of'], 'Перед существительным → despite.'],
      ['___ he was ill, he went to work.', ['Although', 'Despite', 'In spite of', 'However'], 'Перед подлежащим и глаголом → although.'],
      ['You won\'t pass the exam ___ you start studying.', ['unless', 'if', 'in case', 'despite'], 'unless = если не.'],
      ['Take an umbrella ___ it rains.', ['in case', 'unless', 'although', 'despite'], '«На случай, если» → in case.'],
      ['The plan is good. ___, it\'s too expensive.', ['However', 'Although', 'Despite', 'Even though'], 'Новое предложение с противопоставлением → However,'],
      ['You can borrow my car ___ you drive carefully.', ['as long as', 'unless', 'despite', 'whereas'], '«При условии, что» → as long as.']
    ],
    w: []
  },
  {
    id: 'future_adv', lv: 4, kind: 'g', title: 'Future Continuous и Future Perfect',
    rule: [
      '**Future Continuous** (will be + -ing) — процесс в определённый момент будущего: This time tomorrow I**\'ll be flying** to Rome.',
      'Также — вежливый вопрос о планах: **Will** you **be using** the car tonight?',
      '**Future Perfect** (will have + 3-я форма) — что будет завершено к моменту в будущем: By 2030 I **will have paid off** my mortgage.',
      'Ключевые слова: by, by the time, by then, this time next week.'
    ],
    ex: [['I\'ll be working at 9.', 'В 9 я буду работать.'], ['By Friday, I\'ll have finished.', 'К пятнице я закончу.']],
    d: [
      ['Don\'t call me at 8 — I ___ dinner then.', ['\'ll be having', '\'ll have had', 'have', 'had'], 'Процесс в момент будущего → will be having.'],
      ['This time next week we ___ on the beach.', ['will be lying', 'will have lain', 'lie', 'are lain'], 'Процесс в момент будущего → will be lying.'],
      ['By the time you arrive, I ___ the cake.', ['will have baked', 'will bake', 'bake', 'am baking'], 'Завершится к моменту в будущем → will have baked.'],
      ['Hurry! The film ___ by the time we get there.', ['will have started', 'starts', 'will be started', 'has started'], 'К моменту прихода уже начнётся → will have started.'],
      ['By the end of this year, I ___ here for ten years.', ['will have worked', 'will be working', 'work', 'am working'], 'К моменту в будущем → Future Perfect.']
    ],
    w: []
  },
  {
    id: 'causative', lv: 4, kind: 'g', title: 'have something done и сложный пассив',
    rule: [
      '**have / get something done** — кто-то делает это для нас (обычно за плату): I **had my hair cut** (меня подстригли, а не «я подстригся сам»).',
      'We\'re **getting the car repaired**. I need to **have my eyes tested**.',
      'Сложный пассив — в новостях и официальном стиле: **It is said that**… / He **is said to be**…',
      'О прошлом: She **is believed to have left** the country.'
    ],
    ex: [['I had my phone repaired.', 'Мне починили телефон.'], ['He is said to be very rich.', 'Говорят, он очень богат.']],
    d: [
      ['I ___ yesterday. Do you like it?', ['had my hair cut', 'had cut my hair', 'have my hair cut', 'had my hair to cut'], 'Меня подстригли → had my hair cut.'],
      ['We need to ___ before winter.', ['get the roof repaired', 'get repaired the roof', 'have repairing the roof', 'get the roof repair'], 'get + объект + 3-я форма.'],
      ['It ___ that the company will close.', ['is rumoured', 'rumours', 'is rumouring', 'has rumoured'], 'It is rumoured that… — ходят слухи, что…'],
      ['He is believed ___ the money last year.', ['to have stolen', 'to steal', 'stealing', 'that he stole'], 'О прошлом → to have + 3-я форма.'],
      ['The new bridge is expected ___ next year.', ['to be completed', 'to complete', 'completing', 'be completed'], 'Пассив + инфинитив: is expected to be completed.']
    ],
    w: []
  },
  {
    id: 'phrasal', lv: 4, kind: 'v', title: 'Фразовые глаголы',
    rule: [
      'Глагол + частица = новое значение. Учите их во фразах, а не по одному слову.',
      '**give up** — бросить; **look after** — заботиться; **look for** — искать; **find out** — узнать; **turn down** — отклонить; **put off** — отложить.',
      '**get on (with)** — ладить; **run out of** — закончиться (о запасах); **come up with** — придумать; **carry on** — продолжать.',
      '**set up** — основать, настроить; **take off** — взлететь, снять; **break down** — сломаться; **figure out** — разобраться.'
    ],
    ex: [['I gave up sugar.', 'Я отказался от сахара.'], ['We ran out of time.', 'У нас закончилось время.']],
    d: [
      ['We\'ve ___ milk. Can you buy some?', ['run out of', 'run away from', 'run into', 'run over'], 'Закончилось → run out of.'],
      ['Could you ___ my cat while I\'m on holiday?', ['look after', 'look for', 'look up', 'look into'], 'Заботиться → look after.'],
      ['The meeting has been ___ until next week.', ['put off', 'put out', 'put up', 'put on'], 'Отложить → put off.'],
      ['She ___ the job offer because the salary was too low.', ['turned down', 'turned up', 'turned off', 'turned out'], 'Отклонить → turn down.'],
      ['Do you ___ well with your colleagues?', ['get on', 'get over', 'get by', 'get through'], 'Ладить → get on (with).'],
      ['We need to ___ a better idea.', ['come up with', 'come across', 'come down with', 'come over'], 'Придумать → come up with.']
    ],
    w: []
  },
  {
    id: 'collocations', lv: 4, kind: 'v', title: 'Коллокации',
    rule: [
      'Слова «дружат» с определёнными словами, дословный перевод часто ошибочен.',
      '**heavy** traffic / rain (не strong), **strong** coffee, **make** a decision, **take** a photo, **pay** attention, **give** a presentation.',
      '**catch** a cold, **keep** a promise, **break** the law, **do** someone a favour, **highly** recommended, **deeply** sorry.',
      'Записывайте не отдельные слова, а сочетания целиком.'
    ],
    ex: [['Pay attention!', 'Будь внимателен!'], ['She keeps her promises.', 'Она держит обещания.']],
    d: [
      ['There was ___ traffic on the way to work.', ['heavy', 'strong', 'big', 'fat'], 'Heavy traffic — плотное движение.'],
      ['The coffee was too ___ for me.', ['strong', 'heavy', 'powerful', 'hard'], 'Strong coffee — крепкий кофе.'],
      ['Could you ___ attention, please?', ['pay', 'give', 'make', 'do'], 'Pay attention.'],
      ['It took her a long time to ___ a decision.', ['make', 'do', 'get', 'put'], 'Make a decision.'],
      ['Can you ___ me a favour?', ['do', 'make', 'give', 'take'], 'Do someone a favour.'],
      ['You should always ___ your promises.', ['keep', 'hold', 'save', 'stay'], 'Keep a promise.']
    ],
    w: []
  },

  /* ---------- C1 ---------- */
  {
    id: 'inversion', lv: 5, kind: 'g', title: 'Инверсия',
    rule: [
      'После отрицательных и ограничительных наречий в начале предложения порядок слов как в вопросе — для эмфазы и в формальной речи.',
      '**Never have I seen** such chaos. **Rarely does he** complain. **Not only did she** win, but she also broke the record.',
      '**Hardly / Scarcely had** we arrived **when**… **No sooner had** we arrived **than**… **Only after** … **did** I… **Under no circumstances should** you…',
      'Условные без if: **Had I known** (= If I had known), **Were I** you, **Should you need** help, **Were it not for**…',
      '**Little did he know** that… — «он и не подозревал, что…»'
    ],
    ex: [['Never have I felt so happy.', 'Никогда я не был так счастлив.'], ['Should you have any questions, call me.', 'Если возникнут вопросы, звоните.']],
    d: [
      ['Never ___ such a beautiful sunset.', ['have I seen', 'I have seen', 'I saw', 'saw I'], 'Never в начале → инверсия: have I seen.'],
      ['Not only ___ late, but he also forgot the documents.', ['was he', 'he was', 'he is', 'did he be'], 'Not only в начале → инверсия.'],
      ['No sooner had we sat down ___ the phone rang.', ['than', 'when', 'that', 'then'], 'No sooner … than.'],
      ['___ I known about the problem, I would have helped.', ['Had', 'If', 'Have', 'Would'], 'Had I known = If I had known.'],
      ['Under no circumstances ___ the door.', ['should you open', 'you should open', 'you open', 'open you'], 'Under no circumstances → инверсия.'],
      ['Hardly ___ home when it started to rain.', ['had I got', 'I had got', 'did I got', 'I got'], 'Hardly had … when.']
    ],
    w: []
  },
  {
    id: 'mixed_cond', lv: 5, kind: 'g', title: 'Смешанные условные',
    rule: [
      'Условие в прошлом — результат в настоящем: If + **Past Perfect**, **would + глагол**: If I **had taken** that job, I **would be** rich now.',
      'Постоянное условие в настоящем — результат в прошлом: If + **Past Simple**, **would have + 3-я форма**: If I **were** braver, I **would have told** her the truth.'
    ],
    ex: [['If I had slept more, I wouldn\'t be so tired now.', 'Если бы я больше спал, я бы сейчас так не устал.']],
    d: [
      ['If I had studied medicine, I ___ a doctor now.', ['would be', 'would have been', 'will be', 'am'], 'Результат сейчас (now) → would be.'],
      ['If she weren\'t so shy, she ___ to the party last night.', ['would have gone', 'would go', 'will go', 'had gone'], 'Результат в прошлом (last night) → would have gone.'],
      ['If we ___ the map, we wouldn\'t be lost now.', ['had brought', 'brought', 'would bring', 'have brought'], 'Условие в прошлом → Past Perfect.'],
      ['I would be fluent in French now if I ___ in Paris as a child.', ['had lived', 'lived', 'would live', 'have lived'], 'Условие в прошлом (as a child) → had lived.'],
      ['If I ___ my phone at home, I could call a taxi now.', ['hadn\'t left', 'didn\'t leave', 'wouldn\'t leave', 'haven\'t left'], 'Условие в прошлом → Past Perfect.']
    ],
    w: []
  },
  {
    id: 'cleft', lv: 5, kind: 'g', title: 'Усилительные конструкции (cleft)',
    rule: [
      'Чтобы выделить часть предложения: **It is / was … that / who …**: **It was John who** called (а не кто-то другой).',
      'What-конструкции: **What I need is** a holiday. **What surprised me was** his reaction.',
      '**All I want is**… **The reason (why)** … **is that**…',
      'После what-части глагол в единственном числе: What we need **is** more time.'
    ],
    ex: [['What I like about her is her honesty.', 'Что мне в ней нравится — так это честность.'], ['It was in Rome that we met.', 'Познакомились мы именно в Риме.']],
    d: [
      ['___ I really need is a long holiday.', ['What', 'That', 'Which', 'It'], 'What I need is…'],
      ['It was my sister ___ found the keys, not me.', ['who', 'which', 'what', 'whom'], 'It was … who (о человеке-подлежащем).'],
      ['What surprised me most ___ his honesty.', ['was', 'were', 'did', 'had'], 'What-часть → глагол в единственном числе.'],
      ['It\'s not the money ___ matters, it\'s the experience.', ['that', 'what', 'who', 'where'], 'It is … that.'],
      ['All I want ___ some peace and quiet.', ['is', 'are', 'do', 'be'], 'All I want is…']
    ],
    w: []
  },
  {
    id: 'participle', lv: 5, kind: 'g', title: 'Причастные обороты',
    rule: [
      'Сокращают придаточные. **-ing** — одновременное действие или причина: **Feeling** tired, I went to bed early.',
      '**Having + 3-я форма** — действие произошло раньше: **Having finished** the report, she left.',
      '**3-я форма** — пассивное значение: **Built** in 1890, the house needs repairs.',
      'Подлежащее оборота и главного предложения должно совпадать. «Walking down the street, a car hit me» — ошибка: машина не шла по улице.'
    ],
    ex: [['Not knowing what to do, I called my mum.', 'Не зная, что делать, я позвонил маме.'], ['Having lived abroad, he speaks three languages.', 'Пожив за границей, он говорит на трёх языках.']],
    d: [
      ['___ the work, she went home.', ['Having finished', 'Finished', 'Have finished', 'To finish'], 'Сначала закончила, потом ушла → Having finished.'],
      ['___ in 1889, the Eiffel Tower is now a symbol of Paris.', ['Built', 'Building', 'Having building', 'Being build'], 'Башню построили → пассивное значение → Built.'],
      ['___ what to say, he kept silent.', ['Not knowing', 'Knowing not', 'Not known', 'Don\'t knowing'], 'Отрицание перед причастием: Not knowing.'],
      ['The man ___ to the manager is my uncle.', ['talking', 'talked', 'who talking', 'talks'], 'The man talking = the man who is talking.'],
      ['___ by the news, she started to cry.', ['Shocked', 'Shocking', 'Having shocking', 'Shock'], 'Её шокировали → пассивное значение → Shocked.']
    ],
    w: []
  },
  {
    id: 'subjunctive', lv: 5, kind: 'g', title: 'it\'s time / would rather / suggest that',
    rule: [
      '**It\'s (high) time** + Past Simple — «давно пора»: It\'s time we **went** home.',
      '**would rather** + Past Simple о другом человеке: I\'d rather you **didn\'t smoke** here. О себе — глагол без to: I\'d rather **stay**.',
      '**suggest / recommend / insist / demand that** + глагол в начальной форме (сослагательное): I suggest that he **see** a doctor. It\'s essential that she **be** on time.',
      'Также **suggest + -ing**: I suggest **going** (но не «suggest to go»).'
    ],
    ex: [['It\'s time you went to bed.', 'Тебе пора спать.'], ['I\'d rather you came tomorrow.', 'Я бы предпочёл, чтобы ты пришёл завтра.']],
    d: [
      ['It\'s high time you ___ a job.', ['found', 'find', 'will find', 'have found'], 'It\'s high time + Past Simple.'],
      ['I\'d rather you ___ my car tonight.', ['didn\'t take', 'don\'t take', 'not take', 'won\'t take'], 'would rather о другом человеке + Past Simple.'],
      ['The doctor recommended that he ___ smoking.', ['stop', 'to stop', 'stopping', 'will stop'], 'recommend that + начальная форма (сослагательное).'],
      ['I suggest ___ a taxi — it\'s getting late.', ['taking', 'to take', 'take', 'took'], 'suggest + -ing.'],
      ['She\'d rather ___ at home tonight.', ['stay', 'to stay', 'staying', 'stayed'], 'would rather о себе + глагол без to.']
    ],
    w: []
  },
  {
    id: 'idioms', lv: 5, kind: 'v', title: 'Идиомы и устойчивые выражения',
    rule: [
      'Идиомы нельзя переводить по словам. Самые частые в речи:',
      '**a piece of cake** — проще простого; **break the ice** — растопить лёд; **hit the nail on the head** — попасть в точку; **under the weather** — неважно себя чувствовать.',
      '**cost an arm and a leg** — стоить целое состояние; **once in a blue moon** — очень редко; **call it a day** — закончить на сегодня; **get cold feet** — струсить в последний момент.',
      '**the last straw** — последняя капля; **on the fence** — не определился; **a blessing in disguise** — нет худа без добра; **beat around the bush** — ходить вокруг да около.'
    ],
    ex: [['Let\'s call it a day.', 'На сегодня хватит.'], ['It was a blessing in disguise.', 'Нет худа без добра.']],
    d: [
      ['The exam was a piece of ___ — I finished in 20 minutes.', ['cake', 'pie', 'bread', 'sugar'], 'A piece of cake — проще простого.'],
      ['I\'m feeling a bit under the ___ today, so I\'ll stay home.', ['weather', 'rain', 'cloud', 'sky'], 'Under the weather — нездоровится.'],
      ['We only see each other once in a blue ___.', ['moon', 'sky', 'sun', 'day'], 'Once in a blue moon — очень редко.'],
      ['That new phone costs an arm and a ___.', ['leg', 'hand', 'foot', 'head'], 'Cost an arm and a leg — стоить целое состояние.'],
      ['We\'ve been working for 10 hours. Let\'s call it a ___.', ['day', 'night', 'time', 'break'], 'Call it a day — закончить на сегодня.'],
      ['He was going to propose, but he got cold ___.', ['feet', 'hands', 'legs', 'heart'], 'Get cold feet — струсить в последний момент.']
    ],
    w: []
  },

  /* ---------- C2 ---------- */
  {
    id: 'nuance', lv: 6, kind: 'v', title: 'Оттенки значений',
    rule: [
      'На уровне C2 важно чувствовать разницу между близкими словами и регистр.',
      '**imply** (намекать — говорящий) / **infer** (делать вывод — слушающий); **affect** (глагол) / **effect** (существительное).',
      '**economic** (экономический) / **economical** (экономный); **historic** (исторически значимый) / **historical** (относящийся к истории).',
      '**continuous** (непрерывный) / **continual** (повторяющийся с перерывами); **disinterested** (беспристрастный) / **uninterested** (незаинтересованный).',
      '**comprise** (без of) / **consist of**; **comprehensive** (всесторонний) / **comprehensible** (понятный).'
    ],
    ex: [['What are you implying?', 'На что ты намекаешь?'], ['The course comprises ten modules.', 'Курс состоит из десяти модулей.']],
    d: [
      ['From his tone, I ___ that he was unhappy.', ['inferred', 'implied', 'induced', 'insinuated'], 'Делать вывод (слушающий) → infer.'],
      ['A judge must be completely ___ in the case.', ['disinterested', 'uninterested', 'uninteresting', 'disinteresting'], 'Беспристрастный → disinterested.'],
      ['The new policy will ___ thousands of workers.', ['affect', 'effect', 'afflict', 'infect'], 'Глагол «влиять» → affect.'],
      ['This car is very ___ — it uses very little fuel.', ['economical', 'economic', 'economy', 'economist'], 'Экономный → economical.'],
      ['The signing of the treaty was a ___ moment.', ['historic', 'historical', 'history', 'historian'], 'Исторически значимый → historic.'],
      ['The committee ___ ten members.', ['comprises', 'comprises of', 'consists', 'composes'], 'Comprise — без of; consist — только с of.']
    ],
    w: []
  }
];

/* Тест уровня: [уровень, навык (g — грамматика, v — лексика), тема, вопрос, варианты, пояснение] */
const TEST = [
  [1, 'g', 'be', 'I ___ from Russia.', ['am', 'is', 'are', 'be'], 'I → am.'],
  [1, 'g', 'be', '___ your parents at home?', ['Are', 'Is', 'Do', 'Am'], 'Parents — множественное число → Are.'],
  [1, 'g', 'pres_simple', 'She ___ coffee every morning.', ['drinks', 'drink', 'is drink', 'drinking'], 'She + Present Simple → drinks.'],
  [1, 'g', 'pres_simple', 'We ___ live in London.', ['don\'t', 'doesn\'t', 'aren\'t', 'not'], 'We → don\'t.'],
  [1, 'g', 'pres_simple', 'What time ___ he get up?', ['does', 'do', 'is', 'has'], 'He → does.'],
  [1, 'g', 'articles', 'I have ___ apple in my bag.', ['an', 'a', 'the', '— (без артикля)'], 'Apple начинается с гласного звука → an.'],
  [1, 'g', 'there_is', '___ a park near my house.', ['There is', 'There are', 'It is', 'Is'], 'Один парк → There is.'],
  [1, 'g', 'pronouns', 'This is my brother. ___ name is Max.', ['His', 'He', 'Him', 'He\'s'], 'Притяжательное «его» → his.'],
  [1, 'g', 'prep_time', 'My birthday is ___ June.', ['in', 'on', 'at', '— (без предлога)'], 'Месяцы → in.'],
  [1, 'v', 'vocab_basic', 'I\'m ___. Let\'s have lunch.', ['hungry', 'thirsty', 'tired', 'angry'], 'Hungry — голодный.'],
  [1, 'v', 'vocab_basic', 'My mother\'s sister is my ___.', ['aunt', 'uncle', 'cousin', 'niece'], 'Aunt — тётя.'],

  [2, 'g', 'past_simple', 'I ___ my keys yesterday.', ['lost', 'lose', 'have lost', 'losed'], 'Yesterday → Past Simple; lose → lost.'],
  [2, 'g', 'past_simple', '___ you go out last night?', ['Did', 'Were', 'Have', 'Do'], 'Вопрос в Past Simple → Did.'],
  [2, 'g', 'pres_cont', 'Please be quiet. I ___ on the phone.', ['\'m talking', 'talk', 'talking', '\'m talk'], 'Прямо сейчас → Present Continuous.'],
  [2, 'g', 'pres_cont', 'What ___ right now?', ['are you doing', 'do you do', 'you are doing', 'you do'], 'Right now → Present Continuous, вопросительный порядок.'],
  [2, 'g', 'comparatives', 'Her English is ___ than mine.', ['better', 'more good', 'best', 'gooder'], 'good → better.'],
  [2, 'g', 'future', 'I\'ve decided. I ___ learn to drive this year.', ['\'m going to', 'will to', 'going', '\'m go to'], 'Решение уже принято → going to.'],
  [2, 'g', 'quantifiers', 'How ___ people came to the party?', ['many', 'much', 'a lot', 'few'], 'People — исчисляемое → many.'],
  [2, 'g', 'quantifiers', 'There isn\'t ___ sugar in my coffee.', ['any', 'some', 'many', 'a few'], 'Отрицание + неисчисляемое → any.'],
  [2, 'g', 'modals', 'You ___ wear a seatbelt. It\'s the law.', ['have to', 'don\'t have to', 'can', 'mustn\'t'], 'Обязанность по закону → have to.'],
  [2, 'g', 'prep_time', 'She is waiting ___ the bus stop.', ['at', 'in', 'on', 'to'], 'Точка на карте → at.'],
  [2, 'v', 'vocab_basic', 'Could we have the ___, please? We\'d like to pay.', ['bill', 'menu', 'order', 'receipt'], 'Bill — счёт в ресторане.'],

  [3, 'g', 'pres_perfect', 'Have you ever ___ a famous person?', ['met', 'meet', 'meeting', 'to meet'], 'Have + 3-я форма: met.'],
  [3, 'g', 'pres_perfect', 'I ___ to the doctor last Friday.', ['went', 'have gone', 'have been', 'go'], 'Last Friday → Past Simple.'],
  [3, 'g', 'pp_cont', 'I\'ve been waiting for you ___ two hours!', ['for', 'since', 'during', 'from'], 'Период → for.'],
  [3, 'g', 'past_cont', 'I ___ TV when the lights went out.', ['was watching', 'watched', 'am watching', 'have watched'], 'Процесс, прерванный событием → Past Continuous.'],
  [3, 'g', 'cond_1_2', 'If I ___ rich, I would travel around the world.', ['were', 'am', 'will be', 'would be'], '2-й тип: If I were…'],
  [3, 'g', 'passive', 'The film ___ by millions of people last year.', ['was watched', 'watched', 'has watched', 'is watching'], 'Пассив прошедшего: was watched.'],
  [3, 'g', 'gerund_inf', 'I want ___ a new language.', ['to learn', 'learning', 'learn', 'learned'], 'want + to.'],
  [3, 'g', 'used_to', 'I ___ live in a small village, but now I live in a city.', ['used to', 'use to', 'was used to', 'am used to'], 'Прошлое состояние → used to.'],
  [3, 'g', 'relative', 'That\'s the man ___ car was stolen.', ['whose', 'who', 'which', 'that\'s'], '«Чья машина» → whose.'],
  [3, 'g', 'reported', 'She asked me what time ___.', ['it was', 'was it', 'is it', 'did it be'], 'В косвенном вопросе — прямой порядок слов.'],
  [3, 'v', 'confusing', 'Could you ___ me how to get to the station?', ['tell', 'say', 'speak', 'talk'], 'Сказать кому-то → tell me.'],

  [4, 'g', 'past_perfect', 'By the time the police arrived, the thief ___.', ['had escaped', 'has escaped', 'escapes', 'was escaping'], 'By the time + прошлое → Past Perfect.'],
  [4, 'g', 'cond_3', 'If you had told me earlier, I ___ you.', ['could have helped', 'had helped', 'can help', 'will help'], '3-й тип: could have + 3-я форма.'],
  [4, 'g', 'modal_perfect', 'He looks very happy. He ___ the exam.', ['must have passed', 'must pass', 'can\'t have passed', 'should pass'], 'Уверенный вывод о прошлом → must have.'],
  [4, 'g', 'wish', 'I wish I ___ to the party last night. Everyone says it was great.', ['had gone', 'went', 'would go', 'have gone'], 'Сожаление о прошлом → wish + Past Perfect.'],
  [4, 'g', 'linking', '___ having a headache, she went to work.', ['Despite', 'Although', 'Even though', 'However'], 'Перед -ing → despite.'],
  [4, 'g', 'linking', 'I\'ll lend you the money ___ you pay me back by Friday.', ['as long as', 'unless', 'despite', 'whereas'], '«При условии, что» → as long as.'],
  [4, 'g', 'future_adv', 'This time tomorrow, I ___ over the Atlantic.', ['will be flying', 'will fly', 'fly', 'have flown'], 'Процесс в момент будущего → Future Continuous.'],
  [4, 'g', 'causative', 'I\'m ___ next week.', ['having my car serviced', 'having serviced my car', 'having my car to service', 'servicing my car by someone'], 'have + объект + 3-я форма.'],
  [4, 'g', 'causative', 'The suspect is believed ___ the country.', ['to have left', 'leaving', 'that left', 'to leaving'], 'О прошлом → to have + 3-я форма.'],
  [4, 'v', 'phrasal', 'I need to ___ smoking. It\'s bad for my health.', ['give up', 'give in', 'give out', 'give away'], 'Бросить → give up.'],
  [4, 'v', 'collocations', 'Please ___ attention to the safety instructions.', ['pay', 'give', 'make', 'take'], 'Pay attention.'],

  [5, 'g', 'inversion', 'Rarely ___ such a talented young player.', ['have I seen', 'I have seen', 'I saw', 'seen I have'], 'Rarely в начале → инверсия.'],
  [5, 'g', 'inversion', '___ you need any help, don\'t hesitate to call me.', ['Should', 'Would', 'Had', 'Were'], 'Should you need = If you need.'],
  [5, 'g', 'mixed_cond', 'If I had saved money last year, I ___ able to buy a car now.', ['would be', 'would have been', 'will be', 'had been'], 'Результат сейчас → would be.'],
  [5, 'g', 'cleft', '___ annoys me most is his constant complaining.', ['What', 'That', 'Which', 'It'], 'What-конструкция.'],
  [5, 'g', 'participle', '___ his homework, he went out to play.', ['Having done', 'Doing', 'Done', 'Having doing'], 'Сначала сделал, потом пошёл → Having done.'],
  [5, 'g', 'participle', '___ from the top of the hill, the town looks beautiful.', ['Seen', 'Seeing', 'Having seen', 'To see'], 'Город видят → пассив → Seen.'],
  [5, 'g', 'subjunctive', 'It\'s high time the government ___ something about this.', ['did', 'does', 'will do', 'has done'], 'It\'s high time + Past Simple.'],
  [5, 'g', 'subjunctive', 'The manager insisted that the report ___ finished by Friday.', ['be', 'will be', 'to be', 'being'], 'insist that + начальная форма (сослагательное).'],
  [5, 'v', 'idioms', 'Losing that job was a blessing in ___ — I found a much better one.', ['disguise', 'surprise', 'secret', 'hiding'], 'A blessing in disguise — нет худа без добра.'],
  [5, 'v', 'idioms', 'Stop beating around the ___ and tell me what happened.', ['bush', 'tree', 'house', 'point'], 'Beat around the bush — ходить вокруг да около.'],
  [5, 'v', 'collocations', 'The new law has ___ a lot of controversy.', ['sparked', 'lit', 'fired', 'burnt'], 'Spark controversy — вызвать споры.'],

  [6, 'g', 'inversion', '___ it not for your help, I would never have finished.', ['Were', 'Had', 'Was', 'Should'], 'Were it not for = If it were not for.'],
  [6, 'g', 'inversion', 'Little ___ that his life was about to change forever.', ['did he know', 'he knew', 'knew he', 'he did know'], 'Little в начале → инверсия: did he know.'],
  [6, 'g', 'inversion', 'Not until the next morning ___ how serious the situation was.', ['did we realise', 'we realised', 'had we realise', 'we did realise'], 'Not until … → инверсия в главной части.'],
  [6, 'g', 'subjunctive', 'Far be it from me ___ you how to run your business.', ['to tell', 'telling', 'tell', 'that I tell'], 'Устойчивое: Far be it from me to…'],
  [6, 'v', 'nuance', 'The speaker ___ that the government was hiding something, but never said it directly.', ['implied', 'inferred', 'deduced', 'assumed'], 'Намекать (говорящий) → imply.'],
  [6, 'v', 'nuance', 'The noise from the building site was ___ — it didn\'t stop for a second all day.', ['continuous', 'continual', 'contiguous', 'consecutive'], 'Без перерыва → continuous.'],
  [6, 'v', 'nuance', 'The author\'s argument is ___ — it addresses every possible objection.', ['comprehensive', 'comprehensible', 'compressive', 'comprehending'], 'Всесторонний → comprehensive.'],
  [6, 'v', 'nuance', 'The jury must remain completely ___ throughout the trial.', ['impartial', 'partial', 'apathetic', 'indifferent'], 'Беспристрастный → impartial.'],
  [6, 'v', 'idioms', 'He had always toed the ___, so his sudden rebellion surprised everyone.', ['line', 'mark', 'rule', 'border'], 'Toe the line — подчиняться правилам.'],
  [6, 'v', 'idioms', '___ to say, the meeting was cancelled.', ['Needless', 'Unnecessary', 'Useless', 'No need'], 'Needless to say — само собой разумеется.'],
  [6, 'v', 'collocations', 'The proposal met with ___ opposition from local residents.', ['fierce', 'hard', 'wild', 'thick'], 'Fierce opposition — яростное сопротивление.']
];

/* Аудирование (озвучивается синтезатором речи): [уровень, текст, вопрос, варианты, пояснение] */
const LISTEN = [
  [1, 'Hi, I\'m Anna. I\'m twenty-four, and I live in Tel Aviv with my cat.', 'Where does Anna live?', ['In Tel Aviv', 'In Haifa', 'In Jerusalem', 'In London'], '«I live in Tel Aviv».'],
  [1, 'The shop opens at nine and closes at six. On Sunday it\'s closed.', 'When is the shop closed all day?', ['On Sunday', 'On Saturday', 'On Monday', 'Every evening after five'], '«On Sunday it\'s closed».'],
  [2, 'I usually take the bus to work, but today I\'m walking because the weather is so nice.', 'Why is the speaker walking today?', ['The weather is good', 'The bus is late', 'They want to save money', 'Their car is broken'], '«because the weather is so nice».'],
  [2, 'Two coffees and a piece of chocolate cake, please. Oh, and can I have one of the coffees without sugar?', 'What does the customer order?', ['Two coffees and one piece of cake', 'One coffee and two pieces of cake', 'Two coffees, both with sugar', 'Tea and cake'], '«Two coffees and a piece of chocolate cake».'],
  [3, 'I was going to fly to Rome on Friday, but my flight was cancelled, so now I\'m taking the train on Saturday morning instead.', 'How is the speaker travelling now?', ['By train on Saturday', 'By plane on Friday', 'By train on Friday', 'By plane on Saturday'], 'Рейс отменили → «taking the train on Saturday morning instead».'],
  [3, 'Honestly, I liked the film, but it was far too long. I nearly fell asleep in the middle.', 'What did the speaker think of the film?', ['It was good but too long', 'It was boring and short', 'It was excellent from start to finish', 'It was too scary'], '«I liked the film, but it was far too long».'],
  [4, 'Although the restaurant got great reviews, we were pretty disappointed. The food was fine, but we waited almost an hour for our main course, and nobody apologised.', 'What was the main problem?', ['The slow service', 'The quality of the food', 'The high prices', 'The bad reviews'], 'Еда нормальная, но ждали почти час.'],
  [4, 'If I\'d known the meeting had been moved to Thursday, I wouldn\'t have rushed back from my holiday a day early.', 'What do we learn about the speaker?', ['They came back from holiday early for no reason', 'They missed the meeting', 'They extended their holiday', 'They moved the meeting to Thursday'], '3-й тип условных: вернулся раньше зря.'],
  [5, 'It\'s not that I object to the proposal in principle; it\'s more that the timing strikes me as unfortunate, given that half the team is about to go on leave.', 'What is the speaker\'s concern?', ['The timing of the proposal', 'The idea itself', 'The cost of the proposal', 'The team\'s skills'], '«not that I object… in principle; …the timing strikes me as unfortunate».'],
  [5, 'Had the council listened to residents\' concerns from the outset, they might have avoided the costly legal battle they\'re now facing.', 'What does the speaker suggest?', ['The council should have listened to residents earlier', 'The residents started the legal battle on purpose', 'The legal battle is already over', 'The council has won the case'], 'Had the council listened = If the council had listened (инверсия).']
];

/* Чтение: тексты с вопросами [вопрос, варианты, пояснение] */
const READING = [
  {
    id: 'r2', lv: 2, title: 'A message from Lena',
    text: 'Hi Sam! Thanks for inviting me to your birthday party on Saturday. I\'d love to come, but I have to work until 6 p.m. Is it OK if I arrive at about 7? I can bring some drinks or a salad — just tell me what you need. See you soon! Lena',
    qs: [
      ['Why will Lena be late?', ['She has to work', 'She is ill', 'She is buying a present', 'She doesn\'t like parties'], '«I have to work until 6 p.m.»'],
      ['What does Lena offer to do?', ['Bring food or drinks', 'Make the birthday cake', 'Help Sam clean up', 'Pick Sam up at 6'], '«I can bring some drinks or a salad».']
    ]
  },
  {
    id: 'r3', lv: 3, title: 'Working from home',
    text: 'Since the pandemic, millions of people have started working from home at least a few days a week. Many say they are happier because they no longer spend hours commuting and can organise their day more flexibly. However, not everyone enjoys it. Some people find it hard to separate work from their private life, and others miss chatting with colleagues. Several companies now offer a "hybrid" model, in which employees spend part of the week in the office and part at home.',
    qs: [
      ['Why are many people who work from home happier?', ['They don\'t waste time travelling to work', 'They earn more money', 'They work fewer hours', 'They don\'t have a boss'], '«they no longer spend hours commuting».'],
      ['What is a "hybrid" model?', ['Working partly at home and partly in the office', 'Working only from home', 'Having two different jobs', 'Working night shifts'], '«part of the week in the office and part at home».']
    ]
  },
  {
    id: 'r4', lv: 4, title: 'Why we sleep',
    text: 'For decades, sleep was regarded as little more than a passive state in which the body simply switched off. Recent research, however, paints a very different picture. While we sleep, the brain is surprisingly active: it sorts and stores memories, clears away waste products that build up during the day and regulates hormones that control appetite. Scientists now believe that regularly getting less than seven hours a night may increase the risk of a range of health problems, from obesity to heart disease. Despite this, surveys suggest that around a third of adults regularly fail to get enough sleep, often because of long working hours or late-night screen use.',
    qs: [
      ['According to the text, what has changed?', ['Our understanding of what happens during sleep', 'The number of hours people sleep', 'The way the body produces hormones', 'The main cause of heart disease'], '«Recent research, however, paints a very different picture».'],
      ['Which statement is supported by the text?', ['Many adults don\'t get enough sleep', 'The brain stops working during sleep', 'Using screens at night improves sleep', 'Seven hours of sleep is too much'], '«around a third of adults regularly fail to get enough sleep».']
    ]
  },
  {
    id: 'r5', lv: 5, title: 'The paradox of choice',
    text: 'It seems intuitive that more options should make us happier: if we can choose from fifty varieties of jam rather than five, we are more likely to find one that suits us perfectly. Yet a growing body of research suggests that an abundance of choice can be paralysing. In one widely cited study, shoppers presented with a large selection of jams were far less likely to buy any at all than those offered only a handful. Psychologists argue that as options multiply, so does the fear of making the wrong decision, and even a good choice may leave us dissatisfied because we keep wondering about the alternatives we rejected.',
    qs: [
      ['What was the result of the jam study?', ['Fewer people bought jam when there was more choice', 'People bought more jam when there were more options', 'Shoppers preferred cheaper jam', 'Shoppers chose the jam they had bought before'], '«were far less likely to buy any at all».'],
      ['According to psychologists, why can many options reduce satisfaction?', ['We keep thinking about the options we didn\'t choose', 'We don\'t have time to taste everything', 'Good products become more expensive', 'We always make the wrong decision'], '«we keep wondering about the alternatives we rejected».']
    ]
  }
];

/* Слова по уровням: [слово, перевод, пример] */
const DECKS = {
  1: [
    ['busy', 'занятой', 'I\'m busy today, sorry.'],
    ['cheap', 'дешёвый', 'This café is cheap and good.'],
    ['expensive', 'дорогой', 'London is very expensive.'],
    ['early', 'рано, ранний', 'I get up early.'],
    ['late', 'поздно; опоздавший', 'Sorry I\'m late!'],
    ['tired', 'уставший', 'I\'m tired after work.'],
    ['hungry', 'голодный', 'Are you hungry?'],
    ['ticket', 'билет', 'Two tickets to Haifa, please.'],
    ['bill', 'счёт (в ресторане)', 'Can we have the bill, please?'],
    ['weather', 'погода', 'The weather is nice today.'],
    ['kitchen', 'кухня', 'She is in the kitchen.'],
    ['neighbour', 'сосед', 'My neighbour has a big dog.'],
    ['job', 'работа, должность', 'I have a new job.'],
    ['holiday', 'отпуск; праздник', 'We\'re on holiday in Spain.'],
    ['near', 'рядом, близко', 'Is there a bank near here?'],
    ['far', 'далеко', 'The station isn\'t far.'],
    ['usually', 'обычно', 'I usually walk to work.'],
    ['sometimes', 'иногда', 'Sometimes I cook dinner.'],
    ['buy', 'покупать', 'I want to buy a new phone.'],
    ['pay', 'платить', 'Can I pay by card?'],
    ['wait', 'ждать', 'Wait for me, please!'],
    ['understand', 'понимать', 'I don\'t understand.'],
    ['ask', 'спрашивать; просить', 'Can I ask a question?'],
    ['answer', 'отвечать; ответ', 'Please answer the phone.'],
    ['learn', 'учить, учиться', 'I\'m learning English.'],
    ['forget', 'забывать', 'Don\'t forget your keys!']
  ],
  2: [
    ['borrow', 'брать взаймы', 'Can I borrow your pen?'],
    ['lend', 'давать взаймы', 'Could you lend me ten dollars?'],
    ['arrive', 'прибывать, приезжать', 'We arrived at the hotel at midnight.'],
    ['book', 'бронировать', 'I booked a table for two.'],
    ['luggage', 'багаж', 'How much luggage do you have?'],
    ['receipt', 'чек, квитанция', 'Keep the receipt.'],
    ['appointment', 'запись (к врачу), встреча', 'I have a doctor\'s appointment at 3.'],
    ['cancel', 'отменять', 'They cancelled the flight.'],
    ['healthy', 'здоровый, полезный', 'Try to eat healthy food.'],
    ['similar', 'похожий', 'Our jobs are similar.'],
    ['probably', 'вероятно', 'I\'ll probably be late.'],
    ['enough', 'достаточно', 'We don\'t have enough time.'],
    ['decide', 'решать', 'I can\'t decide what to wear.'],
    ['remember', 'помнить', 'Do you remember his name?'],
    ['explain', 'объяснять', 'Can you explain this word?'],
    ['invite', 'приглашать', 'They invited us to dinner.'],
    ['prefer', 'предпочитать', 'I prefer tea to coffee.'],
    ['improve', 'улучшать', 'I want to improve my English.'],
    ['return', 'возвращать(ся)', 'I need to return this book.'],
    ['crowded', 'переполненный', 'The bus was very crowded.'],
    ['quiet', 'тихий', 'It\'s a quiet street.'],
    ['dangerous', 'опасный', 'It\'s dangerous to drive so fast.'],
    ['advice', 'совет (неисчисл.)', 'Can you give me some advice?'],
    ['abroad', 'за границей', 'She works abroad.'],
    ['salary', 'зарплата', 'He has a good salary.'],
    ['rent', 'аренда; снимать', 'The rent is too high.'],
    ['bored', 'скучающий', 'I\'m bored. Let\'s go out.'],
    ['worried', 'обеспокоенный', 'I\'m worried about the exam.'],
    ['journey', 'поездка, путь', 'The journey took five hours.'],
    ['suddenly', 'внезапно', 'Suddenly, the lights went out.']
  ],
  3: [
    ['achieve', 'достигать', 'She achieved her goal.'],
    ['afford', 'позволить себе (по деньгам)', 'We can\'t afford a new car.'],
    ['apply for', 'подавать заявку на', 'I applied for a new job.'],
    ['available', 'доступный, свободный', 'Is this room available?'],
    ['complain', 'жаловаться', 'He always complains about the food.'],
    ['convince', 'убеждать', 'She convinced me to come.'],
    ['deal with', 'справляться с', 'I\'ll deal with it tomorrow.'],
    ['efficient', 'эффективный', 'The new system is more efficient.'],
    ['expect', 'ожидать', 'I didn\'t expect to see you here.'],
    ['familiar', 'знакомый', 'Your face looks familiar.'],
    ['increase', 'увеличивать(ся)', 'Prices have increased.'],
    ['opportunity', 'возможность', 'It\'s a great opportunity.'],
    ['persuade', 'уговаривать', 'I persuaded him to stay.'],
    ['purpose', 'цель', 'What\'s the purpose of your visit?'],
    ['reliable', 'надёжный', 'He\'s very reliable.'],
    ['require', 'требовать', 'The job requires experience.'],
    ['responsible', 'ответственный', 'Who is responsible for this?'],
    ['suggest', 'предлагать (идею)', 'I suggest leaving early.'],
    ['support', 'поддерживать', 'My family supports me.'],
    ['waste', 'тратить впустую', 'Don\'t waste time.'],
    ['whereas', 'тогда как', 'I like tea, whereas my wife prefers coffee.'],
    ['attitude', 'отношение', 'She has a positive attitude.'],
    ['average', 'средний', 'The average age is 30.'],
    ['confident', 'уверенный', 'I feel more confident now.'],
    ['disappointed', 'разочарованный', 'I was disappointed with the results.'],
    ['encourage', 'поощрять, вдохновлять', 'My teacher encouraged me.'],
    ['figure out', 'разобраться, понять', 'I can\'t figure out this app.'],
    ['eventually', 'в конце концов', 'Eventually, we found the hotel.'],
    ['in advance', 'заранее', 'Book your tickets in advance.'],
    ['take part in', 'участвовать', 'Twenty teams took part in the competition.']
  ],
  4: [
    ['acknowledge', 'признавать', 'He acknowledged his mistake.'],
    ['approach', 'подход; приближаться', 'We need a new approach.'],
    ['assume', 'предполагать', 'I assume you\'re tired.'],
    ['benefit', 'польза; извлекать пользу', 'Exercise has many benefits.'],
    ['consistent', 'последовательный, стабильный', 'Be consistent in your practice.'],
    ['crucial', 'ключевой, решающий', 'This is a crucial moment.'],
    ['decline', 'снижаться; отклонять', 'Sales declined last year.'],
    ['emphasise', 'подчёркивать', 'She emphasised the importance of sleep.'],
    ['evidence', 'доказательства', 'There is no evidence.'],
    ['feasible', 'осуществимый', 'Is the plan feasible?'],
    ['hesitate', 'колебаться', 'Don\'t hesitate to ask.'],
    ['impact', 'влияние', 'Social media has a huge impact.'],
    ['inevitable', 'неизбежный', 'Change is inevitable.'],
    ['issue', 'проблема, вопрос', 'We need to discuss this issue.'],
    ['maintain', 'поддерживать, сохранять', 'It\'s hard to maintain a healthy diet.'],
    ['negotiate', 'вести переговоры', 'We negotiated a better price.'],
    ['obvious', 'очевидный', 'The answer is obvious.'],
    ['outcome', 'результат, исход', 'The outcome was positive.'],
    ['overcome', 'преодолевать', 'She overcame her fear.'],
    ['reluctant', 'неохотный', 'He was reluctant to help.'],
    ['significant', 'значительный', 'There\'s a significant difference.'],
    ['straightforward', 'простой, понятный', 'The instructions are straightforward.'],
    ['sustainable', 'устойчивый, экологичный', 'We need sustainable energy.'],
    ['thorough', 'тщательный', 'He did a thorough check.'],
    ['undermine', 'подрывать', 'This undermines our efforts.'],
    ['widespread', 'широко распространённый', 'The problem is widespread.'],
    ['take for granted', 'принимать как должное', 'Don\'t take your health for granted.'],
    ['point out', 'указывать', 'She pointed out a mistake.'],
    ['as a result', 'в результате', 'As a result, we lost the deal.'],
    ['on the other hand', 'с другой стороны', 'On the other hand, it\'s cheaper.']
  ],
  5: [
    ['albeit', 'хотя и', 'It was a success, albeit a small one.'],
    ['ambiguous', 'двусмысленный', 'His answer was ambiguous.'],
    ['articulate', 'умеющий ясно выражать мысли', 'She\'s very articulate.'],
    ['coherent', 'связный, логичный', 'Make your argument coherent.'],
    ['compelling', 'убедительный', 'She made a compelling argument.'],
    ['comprehensive', 'всесторонний', 'We did a comprehensive review.'],
    ['controversial', 'спорный', 'It was a controversial decision.'],
    ['detrimental', 'вредный', 'Stress is detrimental to health.'],
    ['discrepancy', 'расхождение', 'There\'s a discrepancy in the figures.'],
    ['elaborate', 'подробно излагать', 'Could you elaborate on that?'],
    ['exacerbate', 'усугублять', 'This will only exacerbate the problem.'],
    ['explicit', 'явный, недвусмысленный', 'The instructions were explicit.'],
    ['foster', 'способствовать развитию', 'Good teachers foster creativity.'],
    ['hinder', 'мешать, препятствовать', 'Bad weather hindered the rescue.'],
    ['inherent', 'присущий', 'There are inherent risks in any investment.'],
    ['meticulous', 'дотошный', 'She\'s meticulous about details.'],
    ['mitigate', 'смягчать', 'We must mitigate the risks.'],
    ['nuance', 'нюанс', 'He understands the nuances of the language.'],
    ['plausible', 'правдоподобный', 'That\'s a plausible explanation.'],
    ['prevalent', 'распространённый', 'This view is prevalent among young people.'],
    ['scrutiny', 'тщательная проверка', 'The company is under public scrutiny.'],
    ['subtle', 'тонкий, едва заметный', 'There\'s a subtle difference.'],
    ['tentative', 'предварительный, неуверенный', 'They reached a tentative agreement.'],
    ['unprecedented', 'беспрецедентный', 'The city saw unprecedented growth.'],
    ['vulnerable', 'уязвимый', 'Children are the most vulnerable.'],
    ['whereby', 'посредством чего', 'It\'s a system whereby users can vote.'],
    ['in hindsight', 'оглядываясь назад', 'In hindsight, it was a mistake.'],
    ['by and large', 'в целом', 'By and large, the trip was a success.'],
    ['to a certain extent', 'в некоторой степени', 'I agree to a certain extent.'],
    ['bear in mind', 'иметь в виду, учитывать', 'Bear in mind that the shop closes early.']
  ]
};

/* Внешние материалы по группам уровней: low — A0–A2, mid — B1–B2, high — C1–C2.
   [название, ссылка, что делать] */
const RES = {
  listen: {
    low: [
      ['News in Levels (уровень 1–2)', 'https://www.newsinlevels.com', 'Прослушайте 2 новости уровня 1–2, затем повторите текст вслух за диктором.'],
      ['BBC Learning English', 'https://www.bbc.co.uk/learningenglish', 'Посмотрите 2–3 коротких видео для начинающих с английскими субтитрами.'],
      ['Уличные интервью Easy English', 'https://www.youtube.com/results?search_query=easy+english+street+interviews', 'Смотрите с двойными субтитрами, выпишите 5 полезных фраз.'],
      ['Мультфильм на английском', 'https://www.youtube.com/results?search_query=peppa+pig+english+full+episodes', 'Короткая серия с английскими субтитрами. Повторяйте реплики вслух.']
    ],
    mid: [
      ['BBC 6 Minute English', 'https://www.bbc.co.uk/learningenglish', 'Найдите раздел «6 Minute English», прослушайте выпуск и выпишите 5 новых слов.'],
      ['Breaking News English (уровни 3–4)', 'https://breakingnewsenglish.com', 'Прослушайте новость, затем прочитайте текст и проверьте, что не поняли на слух.'],
      ['Сериал с английскими субтитрами', '', 'Friends, Modern Family или The Office — 1 серия с английскими (не русскими) субтитрами.'],
      ['Подкаст All Ears English', 'https://www.youtube.com/results?search_query=all+ears+english+podcast', 'Один выпуск; поставьте скорость 0.9, если трудно.']
    ],
    high: [
      ['TED Talks', 'https://www.ted.com/talks', 'Выступление на интересную тему: сначала без субтитров, затем фрагменты с английскими.'],
      ['Luke\'s English Podcast', 'https://www.youtube.com/results?search_query=luke%27s+english+podcast', 'Один выпуск. Запишите 5 выражений, которые хотите использовать.'],
      ['BBC Radio 4 / The Economist podcasts', 'https://www.bbc.co.uk/sounds', 'Новостной или аналитический подкаст носителей без адаптации.'],
      ['Фильм без субтитров', '', 'Фрагмент 15–20 минут без субтитров, затем непонятные места — с английскими.']
    ]
  },
  read: {
    low: [
      ['News in Levels', 'https://www.newsinlevels.com', 'Прочитайте 2 новости уровня 1–2 и перескажите вслух одну из них.'],
      ['Адаптированная книга (Oxford Bookworms / Penguin Readers, уровни 1–2)', '', 'Прочитайте 5–10 страниц, не переводя каждое слово.'],
      ['Breaking News English (уровни 0–2)', 'https://breakingnewsenglish.com', 'Одна новость самого простого уровня и упражнения к ней.']
    ],
    mid: [
      ['Breaking News English (уровни 3–4)', 'https://breakingnewsenglish.com', 'Новость + упражнения на лексику.'],
      ['Адаптированная книга (уровни 3–5)', '', 'Прочитайте главу. Выпишите 5 слов в «Мои слова».'],
      ['Simple English Wikipedia', 'https://simple.wikipedia.org', 'Статья на тему, которая вам интересна.'],
      ['BBC News', 'https://www.bbc.com/news', 'Одна короткая статья; перескажите её в 3–4 предложениях.']
    ],
    high: [
      ['The Guardian / BBC Future', 'https://www.bbc.com/future', 'Длинная статья: выделите позицию автора и аргументы.'],
      ['Aeon Essays', 'https://aeon.co', 'Эссе на 15 минут. Сформулируйте главную мысль в одном предложении.'],
      ['Книга в оригинале', '', '15–20 страниц без словаря; по словарю — только ключевые слова.']
    ]
  }
};

/* Темы для говорения и письма */
const PROMPTS = {
  speak: {
    low: ['Tell me about yourself: name, city, job, family.', 'Describe your flat or your room.', 'What did you do yesterday? (Past Simple)', 'Describe your typical day.', 'What is your favourite food and why?', 'What are you going to do this weekend?', 'Describe your best friend.', 'Talk about your last holiday.'],
    mid: ['Describe a trip that you will never forget.', 'What are the pros and cons of working from home?', 'Tell me about a film or series you watched recently.', 'What would you do if you won a million dollars?', 'Describe a person who has influenced you.', 'Talk about a difficult situation and how you solved it.', 'How has your city changed in the last ten years?', 'What skills will be important in the future?'],
    high: ['Should cities ban cars from their centres? Argue both sides.', 'How will AI change your profession in the next ten years?', 'Summarise and comment on today\'s top news story.', 'Describe a decision you regret and what you would do differently.', 'Is remote work a blessing or a threat to team culture?', 'To what extent should governments regulate social media?', 'What makes a good leader? Give real examples.', 'Is it better to specialise or to be a generalist?']
  },
  speakGoal: {
    travel: ['Role-play: checking in at a hotel and asking about breakfast.', 'Role-play: ordering food and asking about the ingredients.', 'Role-play: asking for directions to the station.', 'Role-play: a problem at the airport — your luggage is lost.'],
    work: ['Introduce yourself as if at a job interview.', 'Explain what you do at work to someone outside your field.', 'Small talk with a colleague on Monday morning.', 'Present a project update in 2 minutes.'],
    exam: ['IELTS Speaking Part 2: describe a place you would like to visit (2 minutes).', 'IELTS Speaking Part 2: describe a useful skill you learned.', 'IELTS Speaking Part 3: should children learn foreign languages at school?', 'IELTS Speaking Part 2: describe a book that influenced you.'],
    talk: ['Small talk: the weather, weekend plans, hobbies.', 'Tell a funny story that happened to you.', 'Talk about your favourite music and why you like it.', 'Describe your perfect day off.']
  },
  write: {
    low: ['Write an email to a friend about your weekend (50–80 words).', 'Describe your family (50–80 words).', 'Write about your daily routine (50–80 words).', 'Write a short message inviting a friend to dinner (40–60 words).'],
    mid: ['What are the advantages and disadvantages of social media? (120–150 words)', 'Write a review of a film or a restaurant (120–150 words).', 'Describe your dream job and explain why (120–150 words).', 'Write a story that begins: "I opened the door and couldn\'t believe my eyes…" (120–150 words)'],
    high: ['Opinion essay: should university education be free? (200–250 words)', 'Write a formal complaint about a delayed flight (180–220 words).', 'Is it better to rent or buy a home? Discuss both views (200–250 words).', 'Write an article: "The skill everyone should learn" (200–250 words).']
  },
  writeGoal: {
    travel: ['Write a hotel review (100–150 words).', 'Write an email to a hotel asking about early check-in (80–120 words).'],
    work: ['Write a formal email asking your manager for a day off (80–120 words).', 'Write a short LinkedIn post about a recent achievement (80–120 words).'],
    exam: ['IELTS Task 2: some people think that technology makes us less social. Discuss (250 words).', 'IELTS Task 1 (letter): write to a neighbour about a noise problem (150 words).'],
    talk: ['Write a message to a new friend telling them about your hobbies (80–120 words).']
  }
};
