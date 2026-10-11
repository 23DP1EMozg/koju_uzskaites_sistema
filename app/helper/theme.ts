export type ColorTheme = {
    accentColor: string
    homeBg: string
    widgetBg: string
    notificationBg: string
    faqCardBg: string
}

const redTheme: ColorTheme = {
    accentColor: '#993831',
    homeBg: '/backgrounds/redTheme/RedHomeScreenBg.png',
    widgetBg: '/backgrounds/redTheme/RedGradientWidgetBg.png',
    notificationBg: '/backgrounds/redTheme/NotificationContainerRedBg.png',
    faqCardBg: '/backgrounds/redTheme/ImageBgFAQRed.png',
}

const orangeTheme: ColorTheme = {
    accentColor: '#E4815A',
    homeBg: '/backgrounds/orangeTheme/OrangeHomeScreenBg.png',
    widgetBg: '/backgrounds/orangeTheme/OrangeGradientWidgetBg.png',
    notificationBg: '/backgrounds/orangeTheme/NotificationContainerOrangeBg.png',
    faqCardBg: '/backgrounds/orangeTheme/ImageBgFAQorange.png',
}

const yellowTheme: ColorTheme = {
    accentColor: '#FEE16D',
    homeBg: '/backgrounds/yellowTheme/YellowHomeScreenBg.png',
    widgetBg: '/backgrounds/yellowTheme/YellowGradientWidgetBg.png',
    notificationBg: '/backgrounds/yellowTheme/NotificationContainerYellowBg.png',
    faqCardBg: '/backgrounds/yellowTheme/ImageBgFAQYellow.png',
}

const greenTheme: ColorTheme = {
    accentColor: '#84CA96',
    homeBg: '/backgrounds/greenTheme/GreenHomeScreenBg.png',
    widgetBg: '/backgrounds/greenTheme/GreenGradientWidgetBg.png',
    notificationBg: '/backgrounds/greenTheme/NotificationContainerGreenBg.png',
    faqCardBg: '/backgrounds/greenTheme/ImageBgFAQGreen.png',
}

const floorThemes: Record<number, ColorTheme> = {
    1: orangeTheme,
    2: yellowTheme,
    3: greenTheme,
    4: orangeTheme,
    5: yellowTheme,
}

// Red is the fallback while the student has no floor assigned yet
export function getFloorTheme(floor?: number | null): ColorTheme {
    return (floor != null && floorThemes[floor]) || redTheme
}
