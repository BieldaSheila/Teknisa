const express = require('express');
const bodyParser = require ('body-parser');
const programmer = require ('./database/tables/programmer');

const app = express();
const port = 5000;

app.use (bodyParser.json());

//verifica existência do ID na base// 
const validateID = async(params) => {
    try{
            if (!('id' in params)){
            throw `Missing 'id' in request body`;
            return;
        }

        const record = await programmer.findByPk(params.id);

        if(!record){
            throw `Programmer ID not found.`;
            return;
        } 
    }catch(error){
        throw error;
    }
}

//valida as propriedades recebidas no body//
const validateProperties = (properties,params,fn) =>{
        
    try{
        const check = properties[fn]((property)=>{
            return property in params;
        });

        if (!check){
            const propStr = properties.join(', ');
            throw `Request body doesn't have any of the following properties: ${propStr}`;
        }
        return true;
        


    }catch(error){
        throw error;

    }
}
/*app.get ('/', (req, res) => {
    res.sendFile('index.html',{root: __dirname});

});*/


app.listen(port, () => {
    console.log(`Now listening on port ${port}`);

});

//criando e sincronizando rota//
app.get ('/sync/dataBase',async(req, res) => {
    const database = require ('./database/db');

    try{
        await database.sync();

        res.send (`Database successfully sync'ed`);
    } catch{
        res.send(error);
    }

});

//criando novo registro na Database//

app.post ('/createProgrammer',async(req, res) => {
    try {
        const params = req.body;
        const propeties = ['name', 'python', 'javascript', 'java'];
        validateProperties(properties,params,'every');
        const NewProgrammer = await programmer.create ({
            name: params.name,
            python: params.python,
            javascript: params.javascript,
            java: params.java
        });
        
        res.send (NewProgrammer);

        } catch(error){
            res.send(error);

        }
});

//buscando registro na Database//

app.get('/retrieveProgrammer',async(req, res) => {
    try {
        const params = req.body;
        if ('id' in params){
            const record = await programmer.findByPk(params.id);
        
            if (record){
                res.send(record);
            } 
            else{
                res.send('No programmer found using received ID');
            }

            return;
        }

        const records = await programmer.findAll();
        res.send(records);        
    }catch(error){
        res.send (error);
    }
});

//atualizando registro na Database//

app.put('/updateProgrammer',async(req, res) => {
    try{
        const params = req.body;

       const record = await validateID(params);

        const properties = ['name','python','javascript','java'];

        validateProperties(properties,params,'some');

        record.name = params.name || record.name;
        record.python = params.python || record.python;
        record.javascript = params.javascript || record.javascript;
        record.java = params.java || record.java;

        await record.save();

        res.send (`${record.id} ${record.name} - Updated successfully`);

        } catch(error){
        res.send(error);
     }
});

//deletando registro na Database//
app.delete ('/deleteProgrammer',async(req, res) =>{
    try{
        const params = id.body;

        const record = await validateID(params);
        record.destroy();
    
    res.send(`${record.id} ${record.name} - Deleted successfully`);

    } catch(error){
        res.send(error);
    }


});