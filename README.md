# linkedout

## Установка
```npm i```

## Запуск
```npm run launch```
- Логинимся
- Фармим лут

## Демо
- [Скачать демо](https://github.com/sanyabeast/linkedout/raw/master/demo.mp4)
- [Скачать демо 2](https://github.com/sanyabeast/linkedout/raw/master/demo2.mp4)

## Дополнительно
- Скрипт работает с контентом на странице, т.е. нажимет кнопочки
- В скрипте есть проверки на содердимое узла, поэтому работает только на русской версии linkedin
- В любом окне можно отрыть дев-тулзы или обновить страницу используя стандартные хромовские ```ctrl-r``` и ```ctrl-shift-i```
- При загрузке новой страницы, срабатывает скролл вниз до конца, для того, чтобы подгрузить больше контента. (не баг, а фича)
- слишком низкий множитель задержки может привести к непредвиденному поведению при добавлении контактов т.к. не успевает отрботать нажатие на дополнительное подтверждение, при данном сценарии рекомендуемое значение - стандартное, т.е. 1 
- Тестировалось на Windows 10 + Node 14.4.0
