const Member = require ("../models/Member");

let restaurantController = module.exports;

restaurantController.getSignupMyRestaurant = async (req,res) => {
    try {
        console.log ("GET: cont/getSignUpMyRestaruant");
        res.render ('signup');
    } catch (err) {
        console.log (`ERROR, cont/getSignUpMyRestaurant, ${err.message}`);
        res.json ({ state: "fail", message: err.message});
    }

}

restaurantController.getMyRestaurantData = async (req,res) => {
    try {
        console.log ("GET: cont/getMyRestaurantData");
        // TODO Get my restaurant products
        res.render ('restaurant-menu')
        
    } catch (err) {
        console.log (`ERROR, cont/getMyRestaurantData, ${err.message}`);
        res.json ({ state: "fail", message: err.message});
    }
}

restaurantController.signupProcess = async (req,res) => {
    try{
        console.log ("post:cont/signup");
        const data  = req.body;
        const member = new Member();
        const new_member = await member.signupData(data);

        req.session.member = new_member;
        res.redirect('/resto/products/menu');

        
        res.json ({state:"succeed", data: new_member});
    } catch(err){
        console.log (`ERROR, cont/signup, ${err.message}`);
        res.json({ state:"fail", message: err.message});
    }
};

// ** Login Page**
restaurantController.getLoginMyRestaurant = async (req,res) => {
    try {
        console.log ("GET: cont/getLoginMyRestaruant");
        res.render ('login-page');
    } catch (err) {
        console.log (`ERROR, cont/getLoginMyRestaurant, ${err.message}`);
        res.json ({ state: "fail", message: err.message});
    }

};



restaurantController.loginProcess = async (req,res) => {
    try{
        console.log ("post:cont/login");
        const data  = req.body;
        const member = new Member();
        const result = await member.loginData(data);

        req.session.member = result;
        req.session.save (function () {
            res.redirect ("/resto/products/menu");
        }); 
        
    
    } catch(err){
        console.log (`ERROR, cont/login, ${err.message}`);
        res.json({ state:"fail", message: err.message});
    }
};





restaurantController.logout = (req,res) => {
    console.log ("Get cont.logout");
    res.send ("You are in logout page");
};

restaurantController.checkme = (req,res) => {
    if ( req.session?.member) {
        res.json ({state: "succeed", data: req.session.member})
    } else {
        res.json ({state : "fail", message : "Your are not authenticated"});
    }
};