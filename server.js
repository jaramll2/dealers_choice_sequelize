const Sequelize  = require("sequelize");
const sequelize = new Sequelize("postgres://localhost/birthdays_db");
const STRING = Sequelize.STRING;

//models
const Friend = sequelize.define('friend',{
    name:{
        type: STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    birthday: {
        type: STRING,
    }
});

const Zodiac = sequelize.define('zodiac',{
    name:{
        type: STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
});

Friend.belongsTo(Zodiac);
Zodiac.hasMany(Friend);

const syncAndSeed = async ()=>{
    try{
        //insert zodiac signs
        const aries = await Zodiac.create({name: 'Aries'});
        const taurus = await Zodiac.create({name: 'Taurus'});
        const gemini = await Zodiac.create({name: 'Gemini'});
        const cancer = await Zodiac.create({name: 'Cancer'});
        const leo = await Zodiac.create({name: 'Leo'});
        const virgo = await Zodiac.create({name: 'Virgo'});
        const libra = await Zodiac.create({name: 'Libra'});
        const scorpio = await Zodiac.create({name: 'Scorpio'});
        const sagittarius = await Zodiac.create({name: 'Sagittarius'});
        const capricorn = await Zodiac.create({name: 'Capricorn'});
        const aquarius = await Zodiac.create({name: 'Aquarius'});
        const pisces = await Zodiac.create({name: 'Pisces'});

        //insert friends
        await Friend.create({name: 'Natalia', birthday: '1/18', zodiacId: capricorn.id});
        await Friend.create({name: 'Nathalie', birthday: '2/6', zodiacId: aquarius.id});
        await Friend.create({name: 'Nylsa', birthday: '2/23', zodiacId: pisces.id});
        await Friend.create({name: 'Ashley', birthday: '3/4', zodiacId: pisces.id});
        await Friend.create({name: 'Maribel', birthday: '3/7', zodiacId: pisces.id});
        await Friend.create({name: 'Solomon', birthday: '3/19', zodiacId: pisces.id});
        await Friend.create({name: 'Eric', birthday: '3/21', zodiacId: aries.id});
        await Friend.create({name: 'Emily', birthday: '3/22', zodiacId: aries.id});
        await Friend.create({name: 'John', birthday: '3/23', zodiacId: aries.id});
        await Friend.create({name: 'Jake', birthday: '4/14', zodiacId: aries.id});
        await Friend.create({name: 'Joslyn', birthday: '4/18', zodiacId: aries.id});
        await Friend.create({name: 'Jazz', birthday: '4/27', zodiacId: taurus.id});
        await Friend.create({name: 'Stephanie', birthday: '7/3', zodiacId: cancer.id});
        await Friend.create({name: 'Victor', birthday: '7/12', zodiacId: cancer.id});
        await Friend.create({name: 'Kay', birthday: '7/16', zodiacId: cancer.id});
        await Friend.create({name: 'Victoria', birthday: '8/14', zodiacId: leo.id});
        await Friend.create({name: 'Anthony', birthday: '9/1', zodiacId: virgo.id});
        await Friend.create({name: 'Beth', birthday: '9/3', zodiacId: virgo.id});
        await Friend.create({name: 'Mariano', birthday: '10/9', zodiacId: libra.id});
        await Friend.create({name: 'Brandon', birthday: '10/28', zodiacId: scorpio.id});
        await Friend.create({name: 'Janessa', birthday: '10/30', zodiacId: scorpio.id});
        await Friend.create({name: 'Melissa', birthday: '11/12', zodiacId: scorpio.id});
        await Friend.create({name: 'Veronica', birthday: '11/19', zodiacId: scorpio.id});
        await Friend.create({name: 'Jasmine', birthday: '12/12', zodiacId: sagittarius.id});
        await Friend.create({name: 'Elmer', birthday: '12/19', zodiacId: sagittarius.id});
    }
    catch(err){
        console.log(err);
    }

};


//express
const express = require('express');
const app = express();
app.use('/assets',express.static('assets'));
app.use(express.urlencoded({extended: false}));

//routes
app.get('/', async(req,res,next)=>{
    try{
        const friends = await Friend.findAll({
            order: [ ['id', 'ASC']],
            include: [ Zodiac ]
        });

        const html = friends.map(friend=>{
            return `
                <div class = 'friendName'>
                    ${friend.name}
                </div>
                <div class = 'birthday'>
                    ${friend.birthday} 
                </div>
                <div class = 'sign'>
                    <a href ='/zodiac/${friend.zodiacId}'> ${friend.zodiac.name} </a>
                </div>
            `;
        }).join('');


        res.send(`
            <html>
                <head>
                    <title> Birthdays </title>
                    <link rel='stylesheet' href='/assets/styles.css' />
                </head>

                <body>
                    <h1>Friends' Birthdays</h1>

                    <div id='list'>
                        ${html}
                    </div>
                </body>
            </html>
        `);
    }
    catch(err){
        next(err);
    }
});

app.get('/zodiac/:id', async(req,res,next)=>{
    try{
        const sign = await Zodiac.findByPk(req.params.id, {
            include:  [Friend] 
        });
        
        const html = sign.friends.map(friend=>{
            return `
                <div class = 'friendBirthday'>
                    ${friend.name}, birthday is ${friend.birthday}
                </div>
            `;
        }).join('');

        res.send(`
            <html>
                <head>
                    <title>${sign.name} Friends</title>
                    <link rel='stylesheet' href='/assets/styles.css' />
                </head>

                <body>
                    <h1>${sign.name} Friends <small> <a href='/'>(Go Back)</a> </small></h1> 
                    
                    <div class ='friendList'>
                        ${html}
                    </div>
                </body>
            </html>
        `);
    }
    catch(err){
        next(err);
    }
});

const setUp = async()=>{
    try{
        await sequelize.sync({force: true});
        console.log('synced');

        syncAndSeed();
        
        const port = process.env.PORT || 3000;
        app.listen(port, ()=> console.log(`listening on ${port}`));
    }
    catch(err){
        console.log(err);
    }
};

setUp();
