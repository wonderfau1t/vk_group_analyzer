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
        ],
        [
            {
                'action': {
                    'type': 'text',
                    'label': 'Доп. функционал 1'
                },
                'color': 'secondary'
            }
        ],
        [
            {
                'action': {
                    'type': 'text',
                    'label': 'Доп. функционал 2'
                },
                'color': 'secondary'
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
