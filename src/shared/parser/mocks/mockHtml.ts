import { parseFragment } from '../parsers'

export const mockHtmlWith404 = `
    <!DOCTYPE html>
    <html>
        <head><title>404 Not Found</title></head>
        <body>
            <h1>404 Not Found</h1>
        </body>
    </html>
`

export const mockHtmlLeadQual = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>ЛАЗАНИЕ НА ТРУДНОСТЬ - Квалификация</title>
    </head>
    <body>
    <div id="title">
        <h3>ВЮС Приз памяти Владимира Маламида 2026</h3>
        <h1>Девушки 13-14 лет - ЛАЗАНИЕ НА ТРУДНОСТЬ - Квалификация (трасса 1)</h1>
    </div>
    <table>
    <thead>
        <tr>
            <th rowspan="2">Место</th>
            <th rowspan="2">ИН</th>
            <th rowspan="2">Ст. N</th>
            <th rowspan="2">Фамилия, имя</th>
            <th rowspan="2">Команда</th>
            <th>Результат</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td class="rank">1</td>
            <td class="id">116</td>
            <td class="st">19</td>
            <td class="name">Татищева Ксения</td>
            <td class="command">КЛНД</td>
            <td class="res">31+</td>
        </tr>
        <tr>
            <td class="rank">2</td>
            <td class="id">483</td>
            <td class="st">18</td>
            <td class="name">Зырянова Станислава</td>
            <td class="command">СПБ</td>
            <td class="res">30+</td>
        </tr>
        <tr>
            <td class="rank">2</td>
            <td class="id">245</td>
            <td class="st">53</td>
            <td class="name">Евдокимова Елена</td>
            <td class="command">МСК</td>
            <td class="res">30+</td>
        </tr>
    </tbody>
    </table>
    </body>
</html>
`
export const mockParsedLeadQual = parseFragment(mockHtmlLeadQual)

export const mockHtmlLeadQualResults = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>ЛАЗАНИЕ НА ТРУДНОСТЬ - Квалификация сводный</title>
    </head>
    <body>
    <div id="title">
        <h3>ВЮС Приз памяти Владимира Маламида 2026</h3>
        <h1>Девушки 13-14 лет - ЛАЗАНИЕ НА ТРУДНОСТЬ - Квалификация сводный</h1>
    </div>
    <table>
        <thead>
            <tr>
                <th rowspan="2">Место</th>
                <th rowspan="2">ИН</th>
                <th rowspan="2">Фамилия, имя</th>
                <th rowspan="2">Команда</th>
                <th colspan="5">Квалификация</th>
            </tr>
            <tr>
                <th>Тр. 1</th>
                <th>Балл</th>
                <th>Тр. 2</th>
                <th>Балл</th>
                <th>Баллы</th>
            </tr>
        </thead>
    <tbody>
        <tr class="q">
            <td class="rank">1</td>
            <td class="id">116</td>
            <td class="name">Татищева Ксения</td>
            <td class="command">КЛНД</td>
            <td class="res">31+</td>
            <td class="res">1</td>
            <td class="res">27+</td>
            <td class="res">5</td>
            <td class="res">2,24</td>
        </tr>
        <tr>
            <td class="rank">1</td>
            <td class="id">245</td>
            <td class="name">Евдокимова Елена</td>
            <td class="command">МСК</td>
            <td class="res">30+</td>
            <td class="res">2,5</td>
            <td class="res">31+</td>
            <td class="res">2</td>
            <td class="res">2,24</td>
        </tr>
        <tr>
            <td class="rank">3</td>
            <td class="id">57</td>
            <td class="name">Доброва Ксения</td>
            <td class="command">ВРНЖ</td>
            <td class="res">25+</td>
            <td class="res">7</td>
            <td class="res">34</td>
            <td class="res">1</td>
            <td class="res">2,65</td>
        </tr>
    </tbody>
    </table>
    </body>
</html>
`
export const mockParsedLeadQualResults = parseFragment(mockHtmlLeadQualResults)

export const mockHtmlLeadFinal = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>ЛАЗАНИЕ НА ТРУДНОСТЬ - Финал</title>
    </head>
    <body>
    <div id="title">
        <h3>ВЮС Приз памяти Владимира Маламида 2026</h3>
        <h1>Девушки 13-14 лет - ЛАЗАНИЕ НА ТРУДНОСТЬ - Финал</h1>
    </div>
    <table>
    <thead>
        <tr>
            <th rowspan="2">Место</th>
            <th rowspan="2">ИН</th>
            <th rowspan="2">Ст. N</th>
            <th rowspan="2">Фамилия, имя</th>
            <th rowspan="2">Команда</th>
            <th>кв. свод.</th>
            <th>Результат</th>
        </tr>
    </thead>
    <tbody>
        <tr class="q">
            <td class="rank">1</td>
            <td class="id">57</td>
            <td class="st">8</td>
            <td class="name">Доброва Ксения</td>
            <td class="command">ВРНЖ</td>
            <td class="pre">3</td>
            <td class="res">29+</td>
        </tr>
        <tr class="q">
            <td class="rank">2</td>
            <td class="id">483</td>
            <td class="st">5</td>
            <td class="name">Зырянова Станислава</td>
            <td class="command">СПБ</td>
            <td class="pre">6</td>
            <td class="res">29+</td>
        </tr>
        <tr class="q">
            <td class="rank">3</td>
            <td class="id">245</td>
            <td class="st">10</td>
            <td class="name">Евдокимова Елена</td>
            <td class="command">МСК</td>
            <td class="pre">1</td>
            <td class="res">28+</td>
        </tr>
    </tbody>
    </table>
    </body>
</html>
`
export const mockParsedLeadFinal = parseFragment(mockHtmlLeadFinal)

export const mockHtmlBoulderQual = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>БОУЛДЕРИНГ - Квалификация</title>
    </head>
    <body>
    <div id="title">
        <h3>ВЮС Приз памяти Владимира Маламида 2026</h3>
        <h1>Юноши 13-14 лет - БОУЛДЕРИНГ - Квалификация</h1>
    </div>
    <table>
    <thead>
        <tr>
            <th>место</th>
            <th></th>
            <th>ст #</th>
            <th></th>
            <th></th>
            <th>1</th>
            <th>2</th>
            <th>3</th>
            <th>4</th>
            <th>5</th>
            <th>Результат</th>
        </tr>
    </thead>
    <tbody>
    <tr class="q">
        <td class="rank">1</td>
        <td class="id">117</td>
        <td class="st">1</td>
        <td class="name">Боровков Арсений</td>
        <td class="command">КЛНД</td>
        <td class="route"><div class="r_2">2<br>2</div></td>
        <td class="route"><div class="r_2">2<br>2</div></td>
        <td class="route"><div class="r_1"><br>1</div></td>
        <td class="route"><div class="r_2">1<br>1</div></td>
        <td class="route"><div class="r_2">1<br>1</div></td>
        <td class="route_sum route-border-left">109,8</td>
    </tr>
    <tr class="q">
        <td class="rank">2</td>
        <td class="id">543</td>
        <td class="st">2</td>
        <td class="name">Шулев Гавриил</td>
        <td class="command">СВРД</td>
        <!-- td class="route"><div class="r_2">&nbsp;</div></td -->
        <td class="route"><div class="r_2">1<br>1</div></td>
        <!-- td class="route"><div class="r_0">&nbsp;</div></td -->
        <td class="route"><div class="r_0"><br></div></td>
        <!-- td class="route"><div class="r_2">&nbsp;</div></td -->
        <td class="route"><div class="r_2">1<br>1</div></td>
        <!-- td class="route"><div class="r_2">&nbsp;</div></td -->
        <td class="route"><div class="r_2">1<br>1</div></td>
        <!-- td class="route"><div class="r_2">&nbsp;</div></td -->
        <td class="route"><div class="r_2">6<br>6</div></td>
        <td class="route_sum route-border-left">99,5</td>
    </tr>
    <tr class="q">
        <td class="rank">3</td>
        <td class="id">582</td>
        <td class="st">18</td>
        <td class="name">Асташкин Елисей</td>
        <td class="command">ТЮМН</td>
        <!-- td class="route"><div class="r_2">&nbsp;</div></td -->
        <td class="route"><div class="r_2">2<br>1</div></td>
        <!-- td class="route"><div class="r_2">&nbsp;</div></td -->
        <td class="route"><div class="r_2">6<br>3</div></td>
        <!-- td class="route"><div class="r_1">&nbsp;</div></td -->
        <td class="route"><div class="r_1"><br>2</div></td>
        <!-- td class="route"><div class="r_2">&nbsp;</div></td -->
        <td class="route"><div class="r_2">1<br>1</div></td>
        <!-- td class="route"><div class="r_1">&nbsp;</div></td -->
        <td class="route"><div class="r_1"><br>1</div></td>
        <td class="route_sum route-border-left">94,3</td>
    </tr>
    </tbody>
    </table>
    </body>
</html>
`
export const mockParsedBoulderQual = parseFragment(mockHtmlBoulderQual)

export const mockHtmlBoulderFinal = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>БОУЛДЕРИНГ - Финал</title>
    </head>
    <body>
    <div id="title">
        <h3>ВЮС Приз памяти Владимира Маламида 2026</h3>
        <h1>Юноши 13-14 лет - БОУЛДЕРИНГ - Финал</h1>
    </div>
    <table>
    <thead>
        <tr>
            <th>место</th>
            <th></th>
            <th>ст #</th>
            <th></th>
            <th></th>
            <th>квал.</th>
            <th>1</th>
            <th>2</th>
            <th>3</th>
            <th>4</th>
            <th>Результат</th>
        </tr>
    </thead>
    <tbody>
       <tr class="q">
            <td class="rank">1</td>
            <td class="id">174</td>
            <td class="st">9</td>
            <td class="name">Нагорничных Яромир</td>
            <td class="command">ЛЕНГ</td>
            <td class="pre">4</td>
            <!-- td class="route"><div class="r_2">&nbsp;</div></td -->
            <td class="route"><div class="r_2">4<br>4</div></td>
            <!-- td class="route"><div class="r_1">&nbsp;</div></td -->
            <td class="route"><div class="r_1"><br>2</div></td>
            <!-- td class="route"><div class="r_1">&nbsp;</div></td -->
            <td class="route"><div class="r_1"><br>1</div></td>
            <!-- td class="route"><div class="r_1">&nbsp;</div></td -->
            <td class="route"><div class="r_1"><br>1</div></td>
            <td class="route_sum route-border-left">54,6</td>
        </tr>
        <tr class="q">
            <td class="rank">2</td>
            <td class="id">117</td>
            <td class="st">12</td>
            <td class="name">Боровков Арсений</td>
            <td class="command">КЛНД</td>
            <td class="pre">1</td>
            <!-- td class="route"><div class="r_0">&nbsp;</div></td -->
            <td class="route"><div class="r_0"><br></div></td>
            <!-- td class="route"><div class="r_1">&nbsp;</div></td -->
            <td class="route"><div class="r_1"><br>7</div></td>
            <!-- td class="route"><div class="r_2">&nbsp;</div></td -->
            <td class="route"><div class="r_2">4<br>1</div></td>
            <!-- td class="route"><div class="r_1">&nbsp;</div></td -->
            <td class="route"><div class="r_1"><br>1</div></td>
            <td class="route_sum route-border-left">44,1</td>
        </tr>
        <tr class="q">
            <td class="rank">3</td>
            <td class="id">173</td>
            <td class="st">1</td>
            <td class="name">Ганичев Максим</td>
            <td class="command">ЛЕНГ</td>
            <td class="pre">12</td>
            <!-- td class="route"><div class="r_0">&nbsp;</div></td -->
            <td class="route"><div class="r_0"><br></div></td>
            <!-- td class="route"><div class="r_1">&nbsp;</div></td -->
            <td class="route"><div class="r_1"><br>8</div></td>
            <!-- td class="route"><div class="r_1">&nbsp;</div></td -->
            <td class="route"><div class="r_1"><br>1</div></td>
            <!-- td class="route"><div class="r_1">&nbsp;</div></td -->
            <td class="route"><div class="r_1"><br>1</div></td>
            <td class="route_sum route-border-left">29,3</td>
        </tr>
    </tbody>
    </table>
    </body>
</html>
`
export const mockParsedBoulderFinal = parseFragment(mockHtmlBoulderFinal)

// Строки в протоколе скорости приходят без закрывающего </tr> — как на сайте ФСР
export const mockHtmlSpeedQual = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>ЛАЗАНИЕ НА СКОРОСТЬ - Квалификация</title>
    </head>
    <body>
    <div id="title">
        <h3></h3>
        <h1>Мужчины - ЛАЗАНИЕ НА СКОРОСТЬ - Квалификация</h1>
    </div>
    <table style="margin: auto;">
    <thead>
    <tr>
        <th>Место</th>
        <th>ИН</th>
        <th>Ст. N</th>
        <th>Фамилия, имя</th>
        <th>Команда</th>
        <th>Трасса 1</th>
        <th>Ст. N2</th>
        <th>Трасса 2</th>
        <th>Результат</th>
    </tr>
    </thead>
    <tbody>
    <tr class="q">
        <td class="rank">1</td>
        <td class="id">106</td>
        <td class="st">23</td>
        <td class="name">Земляков Петр</td>
        <td class="command">ТЮМН</td>
        <td class="res">06,854</td>
        <td class="res">2</td>
        <td class="res">05,160</td>
        <td class="res">05,160</td>
    <tr>
        <td class="rank">41</td>
        <td class="id">27</td>
        <td class="st">8</td>
        <td class="name">Бадаев Григорий</td>
        <td class="command">МСК</td>
        <td class="res">срыв</td>
        <td class="res">28</td>
        <td class="res">срыв</td>
        <td class="res">срыв</td>
    </tbody>
    </table>
    </body>
</html>
`
export const mockParsedSpeedQual = parseFragment(mockHtmlSpeedQual)

// Сетка финальной части на четверых: полуфинал (колонка 1), финал (колонка 3), победители забегов за I и III место (колонка 5)
export const mockHtmlSpeedFinal = `
    <!DOCTYPE html>
    <html>
    <body>
    <div id="title">
        <h1>Мужчины - ЛАЗАНИЕ НА СКОРОСТЬ - Финальная часть</h1>
    </div>
    <table style="margin: auto;">
    <tbody>
        <tr><td class="pre">1</td><td class="name win">Земляков Петр</td><td class="res win">05,300</td><td></td><td></td><td></td><td></td></tr>
        <tr><td></td><td></td><td class="right-border"></td><td class="name">Земляков Петр</td><td class="res">05,121</td><td></td><td></td></tr>
        <tr><td class="pre">4</td><td class="name">Мороз Михаил</td><td class="res right-border">срыв</td><td></td><td></td></tr>
        <tr><td></td><td></td><td></td><td class="rank">забег за I место</td><td class="right-border"></td><td class="name win">Колдомов Кирилл</td><td class="rank">I</td></tr>
        <tr><td class="pre">2</td><td class="name win">Колдомов Кирилл</td><td class="res win">05,444</td><td></td><td></td><td></td><td></td></tr>
        <tr><td></td><td></td><td class="right-border"></td><td class="name win">Колдомов Кирилл</td><td class="res win">05,030</td><td></td><td></td></tr>
        <tr><td class="pre">3</td><td class="name">Варик Денис</td><td class="res right-border">06,500</td><td></td><td></td><td></td><td></td></tr>
        <tr><td></td><td></td><td></td><td class="name">Мороз Михаил</td><td class="res">07,112</td><td></td><td></td></tr>
        <tr><td></td><td></td><td></td><td class="rank">забег за III место</td><td class="right-border"></td><td class="name win">Варик Денис</td><td class="rank">III</td></tr>
        <tr><td></td><td></td><td></td><td class="name win">Варик Денис</td><td class="res right-border win">05,161</td><td></td><td></td></tr>
    </tbody>
    </table>
    </body>
</html>
`
export const mockParsedSpeedFinal = parseFragment(mockHtmlSpeedFinal)

export const mockHtmlSpeedClassicQual = `
    <!DOCTYPE html>
    <html>
    <body>
    <div id="title">
        <h1>Девушки 10-12 лет - ЛАЗАНИЕ НА СКОРОСТЬ (К) - Квалификация</h1>
    </div>
    <table style="margin: auto;">
    <thead>
    <tr>
        <th>Место</th>
        <th>ИН</th>
        <th>Ст. N</th>
        <th>Фамилия, имя</th>
        <th>Команда</th>
        <th>Трасса 1</th>
        <th>Трасса 2</th>
        <th>Результат</th>
    </tr>
    </thead>
    <tbody>
    <tr class="q">
        <td class="rank">1</td>
        <td class="id">158</td>
        <td class="st">25</td>
        <td class="name">Шепелева Софья</td>
        <td class="command">ПЕРМ</td>
        <td class="res">09,340</td>
        <td class="res">09,490</td>
        <td class="res">18,830</td>
    </tbody>
    </table>
    </body>
</html>
`

// Сетка классической скорости на четверых: блоки div, раунд в классе pc1/pc2, строка в r1…r6, pc3 — победители за I и III место
export const mockHtmlSpeedClassicFinal = `
    <!DOCTYPE html>
    <html>
    <body>
    <div id="title">
        <h1>Девушки 10-12 лет - ЛАЗАНИЕ НА СКОРОСТЬ (К) - Финальная часть</h1>
    </div>
    <div class="p pc1 r1 win">Барях Ю.</div><div class="r rc1 r1 win">17,120</div><div class="fl fc1 r1 win">92</div>
    <div class="p pc1 r2">Прокофьева К.</div><div class="r rc1 r2">21,030</div><div class="fl fc1 r2">140</div>
    <div class="p pc1 r3 win">Черных А.</div><div class="r rc1 r3 win">18,190</div><div class="fl fc1 r3 win">157</div>
    <div class="p pc1 r4">Шепелева С.</div><div class="r rc1 r4">20,950</div><div class="fl fc1 r4">158</div>
    <div class="p pc2 r5">Барях Ю.</div><div class="r rc2 r5">18,010</div><div class="fl fc2 r5">92</div>
    <div class="p pc2 r6 win">Черных А.</div><div class="r rc2 r6 win">17,570</div><div class="fl fc2 r6 win">157</div>
    <div class="p pc2 r7">Шепелева С.</div><div class="r rc2 r7">срыв</div><div class="fl fc2 r7">158</div>
    <div class="p pc2 r8 win">Прокофьева К.</div><div class="r rc2 r8 win">21,450</div><div class="fl fc2 r8 win">140</div>
    <div class="p pc3 r9">Черных А.</div><div class="win r rc3 r9">I</div><div class="fl fc3 r9">157</div>
    <div class="p pc3 r10">Прокофьева К.</div><div class="win r rc3 r10">III</div><div class="fl fc3 r10">140</div>
    <div class="medal gold">забег за I место</div>
    <div class="medal bronze">забег за III место</div>
    </body>
</html>
`
export const mockParsedSpeedClassicFinal = parseFragment(mockHtmlSpeedClassicFinal)

// Неофициальные старты (2610rzn): трасс в квалификации и финале больше, чем на официальных
export const mockHtmlBoulderQualManyRoutes = `
<h1>Мужчины - БОУЛДЕРИНГ - Квалификация</h1>
<table>
<thead>
    <tr><th>место</th><th>ст #</th><th></th><th></th><th></th>
    <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th>
    <th>Результат</th></tr>
</thead>
<tbody>
    <tr class="q">
    <td class="rank">1</td>
    <td class="st">1</td>
    <td class="id">144</td>
    <td class="name">Брит Максим</td>
    <td class="command">Рязанская область</td>
    <!-- td class="route"><div class="r_2">&nbsp;</div></td -->
    <td class="route"><div class="r_2">1<br />1</div></td>
    <td class="route"><div class="r_2">1<br />1</div></td>
    <td class="route"><div class="r_2">1<br />1</div></td>
    <td class="route"><div class="r_2">1<br />1</div></td>
    <td class="route"><div class="r_2">1<br />1</div></td>
    <td class="route"><div class="r_2">1<br />1</div></td>
    <td class="route"><div class="r_2">1<br />1</div></td>
    <td class="route"><div class="r_2">1<br />1</div></td>
    <td class="route"><div class="r_1"><br />3</div></td>
    <td class="route"><div class="r_2">4<br />1</div></td>
    <td class="route_sum route-border-left">249,7</td>
    </tr>
</tbody>
</table>
`
export const mockParsedBoulderQualManyRoutes = parseFragment(mockHtmlBoulderQualManyRoutes)

export const mockHtmlBoulderFinalManyRoutes = `
<h1>Мужчины - БОУЛДЕРИНГ - Финал</h1>
<table>
<thead>
    <tr><th>место</th><th>ст #</th><th></th><th></th><th></th>
    <th>квал.</th>
    <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th>
    <th>Результат</th></tr>
</thead>
<tbody>
    <tr>
    <td class="rank">1</td>
    <td class="st">8</td>
    <td class="id">141</td>
    <td class="name">Ващенко Илья</td>
    <td class="command">Московская область</td>
    <td class="pre">1</td>
    <td class="route"><div class="r_2">1<br />1</div></td>
    <td class="route"><div class="r_2">2<br />2</div></td>
    <td class="route"><div class="r_1"><br />1</div></td>
    <td class="route"><div class="r_2">7<br />1</div></td>
    <td class="route"><div class="r_0">&nbsp;</div></td>
    <td class="route"><div class="r_2">3<br />2</div></td>
    <td class="route_sum route-border-left">84,3</td>
    </tr>
</tbody>
</table>
`
export const mockParsedBoulderFinalManyRoutes = parseFragment(mockHtmlBoulderFinalManyRoutes)

// Международный старт (2605klnd): протоколы на английском, без колонок ст.# у боулдеринга и кв.свода у трудности
export const mockHtmlEnglishIndex = `
<div id="title"><h1>10th Russian-Chinese 2026 Summer Youth Games</h1></div>
<table class="event_table">
<thead><tr><th>LEAD</th><th>BOULDER</th></tr></thead>
<tbody><tr>
<td>
<div class="g_title">Female U17</div>
<div class="p_l"><a href="l_2f_f15.html"><div class="l_pas"></div>Semi-Final</a></div>
<div class="p_l"><a href="l_f_f15.html"><div class="l_run"></div>Final</a></div>
</td>
<td>
<div class="g_title">Female U17</div>
<div class="p_l"><a href="b_2f_f15.html"><div class="l_pas"></div>Semi-Final</a></div>
</td>
</tr></tbody>
</table>
`

export const mockHtmlEnglishLeadSemiFinal = `
<h3>10th Russian-Chinese 2026 Summer Youth Games</h3>
<h1>Female U17 - LEAD - Semi-Final</h1>
<table>
<thead><tr><th>rank</th><th>bib</th><th>st. #</th><th>Name</th><th>Country</th><th>Result</th></tr></thead>
<tbody>
<tr class="q">
    <td class="rank">1</td>
    <td class="id">3</td>
    <td class="st">2</td>
    <td class="name">TAN YOUTIAN </td>
    <td class="command"><span class="nation">CHN</span> <img src="../flags/CHN.png" /></td>
    <!-- td class="pre">0</td -->
    <td class="res">TOP</td>
</tbody>
</table>
`

export const mockHtmlEnglishBoulderSemiFinal = `
<h3>10th Russian-Chinese 2026 Summer Youth Games</h3>
<h1>Female U17 - BOULDER - Semi-Final</h1>
<table>
<thead><tr><th>rank</th><th></th><th></th><th></th><th></th><th>1</th><th>2</th><th>result</th></tr></thead>
<tbody>
    <tr class="q">
    <td class="rank">1</td>
    <!-- td class="st">3</td -->
    <td class="id">3</td>
    <td class="name">TAN YOUTIAN </td>
    <td class="command"><span class="nation">CHN</span> <img src="../flags/CHN.png" /></td>
    <td class="pre">0</td>
    <td class="route"><div class="r_2">1<br />1</div></td>
    <td class="route"><div class="r_1"><br />1</div></td>
<td class="route_sum route-border-left">84,1</td>
</tr>
</tbody>
</table>
`

// Скорости на 2605klnd нет: мок собран по образцу английских протоколов трудности и боулдеринга и русской скорости
export const mockHtmlEnglishSpeedIndex = `
<div id="title"><h1>10th Russian-Chinese 2026 Summer Youth Games</h1></div>
<table class="event_table">
<thead><tr><th>SPEED</th></tr></thead>
<tbody><tr>
<td>
<div class="g_title">Male U17</div>
<div class="p_l"><a href="e_q_m15.html"><div class="l_pas"></div>Qualification</a></div>
<div class="p_l"><a href="e8_f_m15.html"><div class="l_pas"></div>1/4-Final</a></div>
<div class="p_l"><a href="e8_f_m15.html"><div class="l_run"></div>Semi-Final</a></div>
<div class="p_l"><a href="e8_f_m15.html"><div class="l_fut"></div>Final</a></div>
</td>
</tr></tbody>
</table>
`

export const mockHtmlEnglishSpeedQual = `
<h3>10th Russian-Chinese 2026 Summer Youth Games</h3>
<h1>Male U17 - SPEED - Qualification</h1>
<table>
<thead><tr><th>rank</th><th>bib</th><th>st. #</th><th>Name</th><th>Country</th><th>Lane A</th><th>st. #2</th><th>Lane B</th><th>Result</th></tr></thead>
<tbody>
<tr class="q">
    <td class="rank">1</td>
    <td class="id">12</td>
    <td class="st">3</td>
    <td class="name">LI HAO </td>
    <td class="command"><span class="nation">CHN</span> <img src="../flags/CHN.png" /></td>
    <td class="res">06,854</td>
    <td class="res">2</td>
    <td class="res">05,160</td>
    <td class="res">05,160</td>
</tbody>
</table>
`
