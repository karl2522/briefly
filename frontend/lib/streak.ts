const STREAK_KEY = "briefly_study_streak"

type StudyStreak = {
    current: number
    lastDate: string // YYYY-MM-DD
}

function getTodayString() {
    const today = new Date()
    return today.toISOString().slice(0, 10)
}

export function updateStudyStreak() {
    if (typeof window === "undefined") return
    const todayStr = getTodayString()

    try {
        const raw = window.localStorage.getItem(STREAK_KEY)
        if (!raw) {
            const initial: StudyStreak = { current: 1, lastDate: todayStr }
            window.localStorage.setItem(STREAK_KEY, JSON.stringify(initial))
            return
        }

        const parsed: StudyStreak = JSON.parse(raw)
        const lastDate = parsed.lastDate

        if (!lastDate) {
            const initial: StudyStreak = { current: 1, lastDate: todayStr }
            window.localStorage.setItem(STREAK_KEY, JSON.stringify(initial))
            return
        }

        if (lastDate === todayStr) {
            // already counted today
            return
        }

        const last = new Date(lastDate)
        const today = new Date(todayStr)
        const diffDays =
            (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
                Date.UTC(last.getFullYear(), last.getMonth(), last.getDate())) /
            (1000 * 60 * 60 * 24)

        let current = parsed.current || 0
        if (diffDays === 1) {
            current = current + 1
        } else {
            current = 1
        }

        const updated: StudyStreak = { current, lastDate: todayStr }
        window.localStorage.setItem(STREAK_KEY, JSON.stringify(updated))
    } catch (err) {
        console.error("Failed to update study streak:", err)
    }
}

export function getStudyStreak(): number {
    if (typeof window === "undefined") return 0
    try {
        const raw = window.localStorage.getItem(STREAK_KEY)
        if (!raw) return 0
        const parsed: StudyStreak = JSON.parse(raw)
        return parsed.current || 0
    } catch {
        return 0
    }
}

