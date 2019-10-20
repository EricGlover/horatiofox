const superStarTrekGameId = 1;

export default class Service {
    constructor() {
        this.apiUrl = "/games/superStarTrek";
    }

    createGameLog(score, victory, gameId = superStarTrekGameId){
        return $.ajax({
            url: '/gameLog',
            data: JSON.stringify({score, victory, gameId}),
            contentType: 'application/json',
            method: 'POST'
        });
    }

    getHelp(command) {
        return $.ajax({
            url: `${this.apiUrl}/help`,
            data: {command}
        });
    }
}
