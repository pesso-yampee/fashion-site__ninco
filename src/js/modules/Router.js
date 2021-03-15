import Home from '../pages/Home'
import About from '../pages/About'

export default class Router {
  constructor() {
    this.model = {
      pathName: location.pathname,
    }

    this.initRouting()
  }

  initRouting() {
    const pathName = this.model.pathName
    switch (pathName) {
      case '/':
        new Home()
        break
      case '/about':
        new About()
        break
      default:
        break
    }
  }
}
