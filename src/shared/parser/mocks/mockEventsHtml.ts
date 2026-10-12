// Фрагмент https://www.rusclimbing.ru/competitions/ (разметка сохранена как на сайте)
const eventItem = (href: string, date: string, name: string, type: string, groups: string, disciplines: string, location: string) => `
  <li class="table__item" data-accordion="element">
    <a class="table__content calendar__link" data-accordion="content" href="${href}">
      <p class="table__text calendar__date"><span>Даты проведения</span>${date}</p>
      <p class="table__text calendar__name"><span>Название мероприятия</span>${name}</p>
      <p class="calendar__button calendar__button--up" data-accordion="button">Развернуть</p>
      <p class="table__text calendar__type"><span>Тип</span>${type}</p>
      <p class="table__text calendar__group">
        <span>Группы</span>
        ${groups}                            </p>
      <p class="table__text calendar__disciplines">
        <span>Дисциплины</span>
        ${disciplines}                            </p>
      <p class="table__text calendar__location"><span>Локация</span>${location}</p>
      <p class="calendar__button" data-accordion="button">Свернуть</p>
    </a>
  </li>`

export const mockEventsHtml = `
<!DOCTYPE html>
<html>
<body>
  <a href="/competitions/">Календарь</a>
  <ul class="table__list" data-accordion="parent">
    ${eventItem('/competitions/2501vrn/', '05  - 12 января', 'Рождественский турнир', 'С', 'Ю; С; М; П', 'Т; Эт; Б', 'Воронеж')}
    ${eventItem('/competitions/2511kem_perv/', '24 ноября - 01 декабря', 'Первенство СФО', 'С', 'Ю; С', 'Т', 'Кемерово')}
    ${eventItem('/competitions/2511nsk/', '17  - 24 ноября', 'Первенство СФО (отменено)', 'С', 'Ю', 'Т', 'Новосибирск')}
    ${eventItem('/competitions/2507kzn/', '15  - 20 июля', 'Кубок Дружбы - ОТМЕНЕН', 'С', 'Ю', 'Т', 'Казань')}
  </ul>
</body>
</html>
`
