const json = [{
    id: '0',
    name: '1',
    children: [{
        name: '上海转运中心',
        id: '1',
        children: [{
            name: '青浦转运中心',
            id: '2',
            children: [{
                id: '3',
                name: '华新转运中心'
            },
            {
                id: '10',
                name: '华99转运中心'
            }]
        }]
    }, {
        name: '浦东转运中心',
        id: '9'
    }]
}, {
    id: '4',
    name: '湖北省',
    children: [{
        id: '5',
        name: '襄阳市',
        children: [{
            name: '南漳县',
            id: '6'
        }]
    },{
        id: '7',
        name: '枣阳市',
        children: [{
            name: '南漳县99',
            id: '12'
        }]
    },{
        id: '8',
        name: '宜昌市'
    },{
        id: '11',
        name: '宜昌999市'
    }]
}]

// export default json;

window.json = json;