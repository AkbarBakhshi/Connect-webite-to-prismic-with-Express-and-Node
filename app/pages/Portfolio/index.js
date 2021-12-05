import gsap from 'gsap'

export default class Portfolio {
    constructor() {
    }
    create() {
        
    }


    animateIn() {
        return new Promise(resolve => {
            gsap.timeline({ onComplete: resolve })
                .from('.portfolio', { y: '-100vh' })
        })
    }

    animateOut() {
        return new Promise(resolve => {
            gsap.timeline({ onComplete: resolve })
                .to('.portfolio', { y: '100vh' })
        })
    }
}