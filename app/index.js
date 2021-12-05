import Detection from 'classes/detection'

import Transition from 'components/Transition'

import Home from 'pages/Home'
import About from 'pages/About'
import Portfolio from 'pages/Portfolio'
import Four04 from 'pages/Four04'

import gsap from "gsap"
import { TextPlugin } from "gsap/TextPlugin"

gsap.registerPlugin(TextPlugin);

class App {
    constructor() {
        this.createContent()
        this.createPages()
        this.createCursor()
        this.createTransition()

        this.addLinkListeners()
        window.addEventListener('popstate', this.onPopState.bind(this))

    }

    createContent() {
        this.content = document.querySelector('.content')
        this.template = this.content.getAttribute('data-template') // this is the value in each pug file under block variables
    }

    createPages() {
        this.pages = {
            home: new Home(),
            about: new About(),
            portfolio: new Portfolio(),
            four04: new Four04(),
        }
        this.page = this.pages[this.template]
        this.page.create()
        this.page.animateIn()
    }

    createCursor() {
        const cursor = document.querySelector('.cursor')
        if (Detection.isDesktop()) {
            const aTags = document.querySelectorAll('a')
            document.addEventListener('mousemove', (e) => {
                const x = e.clientX
                const y = e.clientY
                cursor.style.left = x + 'px'
                cursor.style.top = y + 'px'
            })

            aTags.forEach(tag => {
                tag.addEventListener('mouseover', () => {
                    // console.log('over')
                    tag.classList.add('curser__hover')
                    cursor.style.borderColor = 'white'
                })
                tag.addEventListener('mouseleave', () => {
                    // console.log('out')
                    tag.classList.remove('curser__hover')
                    cursor.style.borderColor = ''
                })
            })
        } else {
            gsap.set(cursor, { autoAlpha: 0 })
            cursor.style.left = '50%'
            cursor.style.top = '50%'
        }
    }

    createTransition() {
        this.transition = new Transition()
    }

    async onLocalLinkClick({ url, push = true }) {
        const cursor = document.querySelector('.cursor')
        if (!Detection.isDesktop()) {
            gsap.to(cursor, { autoAlpha: 1 })
        }
        cursor.classList.add('cursor__loader')

        const request = await window.fetch(url)
        // console.log(request)

        if (request.status === 200) {
            // console.log(request.text())

            await this.transition.show()
            this.page.animateOut()

            if (push) {
                window.history.pushState({}, '', url)
            }

            const div = document.createElement('div')
            div.innerHTML = await request.text()
            // console.log(div.innerHTML)

            const divContent = div.querySelector('.content')
            this.template = divContent.getAttribute('data-template')
            await this.transition.hide()

            this.content.setAttribute('data-template', this.template)
            this.content.innerHTML = divContent.innerHTML

            this.page = this.pages[this.template]
            this.page.create()
            await this.page.animateIn()

            this.addLinkListeners()

            //In case we navigate to another page without stopping the video in about page
            gsap.set('.cursor__text', {text: 'Play'})

            if (!Detection.isDesktop()) {
                gsap.to(cursor, { autoAlpha: 0 })
            }
            cursor.classList.remove('cursor__loader')

            this.createCursor()
        } else {
            this.onLocalLinkClick({ url: '/' })
        }
    }

    addLinkListeners() {
        const anchorLinks = document.querySelectorAll('a')

        anchorLinks.forEach((link) => {
            link.onclick = event => {
                // console.log(link.href)
                // console.log(window.location.origin)    ----> this will be the 'root' route of our website
                if (link.href.indexOf(window.location.origin) > -1) {    // this means if the href of the link includes the root route of our website
                    event.preventDefault()
                    this.onLocalLinkClick({
                        url: link.href
                    })
                }
            }
        })
    }

    //===========this is when user clicks browser's back button=============
    onPopState() {
        // console.log(window.location.pathname)
        this.onLocalLinkClick({
            url: window.location.pathname,
            push: false
        })
    }

}

new App()