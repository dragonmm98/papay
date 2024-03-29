const Order = require ("../models/Order");
let orderController = module.exports;
const assert = require("assert");
const Definer = require("../lib/mistake");


orderController.createOrder = async (req,res) => {
    try{
         console.log("connect/createOrder")
         assert.ok(req.member, Definer.auth_err5);
         
         const order = new Order();
      const result = await order.createOrderData(req.member, req.body);
                 
        res.json ({state:"succeed", data: result});
    } catch(err){
        console.log (`ERROR, cont/createOrder, ${err.message}`);
        res.json({ state:"fail", message: err.message});
    }
};

orderController.getMyOrders = async (req,res) => {
    try {
        console.log("connect/getMyOrder")
        assert.ok(req.member, Definer.auth_err5);

        const order = new Order();
        const result = await order.getMyOrdersData(req.member, req.query);
        res.json ({state:"succeed", data: result});
       
    } catch (err) {
        console.log (`ERROR, cont/getMyOrder, ${err.message}`);
        res.json({ state:"fail", message: err.message});
    }
};

orderController.editChosenOrder = async (req,res) => {
    try {
        console.log("connect/editChosenOrder")
        assert.ok(req.member, Definer.auth_err5);
        
        const order = new Order();
        const result = await order.editChosenOrderData(req.member, req.body);
        res.json ({state:"succeed", data: result});
    } catch (err) {
        console.log (`ERROR, cont/editChosenOrder, ${err.message}`);
        res.json({ state:"fail", message: err.message});
   
    }
}