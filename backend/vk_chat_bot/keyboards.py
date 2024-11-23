from json import dumps

main_menu_keyboard = dumps({
    'inline': True,
    'buttons': [
        [
            {
                'action': {
                    'type': 'text',
                    'label': 'Аудит сообщества',
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
                    'label': 'Выйти из аудита',
                },
                'color': 'primary'
            }
        ]
    ]
})
