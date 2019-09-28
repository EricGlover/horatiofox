export default class Service {
  constructor() {
    this.apiUrl = "/games/superStarTrek";
  }
  getHelp(command) {
    return $.ajax({
      url: `${this.apiUrl}/help`,
      data: { command }
    });
  }
}
