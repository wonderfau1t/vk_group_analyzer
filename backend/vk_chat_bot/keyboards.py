from json import dumps

main_menu_keyboard = dumps({
    'buttons': [
        [
            {
                'action': {
                    'type': 'text',
                    'label': 'Анализ сообщества',
                },
                'color': 'primary'
            }
        ]
    ]
})

group_analysis_keyboard = dumps({
    'buttons': [
        [
            {
                'action': {
                    'type': 'text',
                    'label': 'Главное меню',
                },
                'color': 'primary'
            }
        ]
    ]
})
