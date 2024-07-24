const mysql=require('mysql');
const express =require('express');
const bodyParser=require('body-parser');
const path=require('path');
const encoder=bodyParser.urlencoded();
const app=express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({ extended: true }));
const connection=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"airline"
});
connection.connect(function(error){
    if (error) throw error;
    else console.log("connected to the database successfully")
});

app.get('/',function(req,res){
    res.render('main_login');
    
});
app.get('/admin',function(req,res){
    res.render('admin_login');});
app.get('/addflight',function(req,res){
    res.render('addflight',{mes:"addflight"});});
app.get('/deleteflight',function(req,res){
    res.render('addflight',{mes:"deleteflight"});});
app.get('/register',function(req,res){
    res.render('register');});
app.post('/booked',encoder,function(req,res){
    let flightname=req.body.flightname;
    let source=req.body.source;
    let destination=req.body.destination;
    let date=req.body.date;
    console.log(flightname);
    connection.query(`select * from seats where source=? and destination=? and flight_name=? and date=?`,[source,destination,flightname,date],(err,result)=>{
      if(err) throw err;
      else{
        console.log(result);
        let ew=result[0].ews,enw=result[0].en,pew=result[0].epw,penw=result[0].epn,bw=result[0].bw,bnw=result[0].bn,fw=result[0].fws,fnw=result[0].fn;
        res.render('booked',{result:result});
        app.post('/book',function(req,res){
            var adults=req.body.adults;
            var children=req.body.children;
            var seniorcitizens=req.body.seniorcitizens;
            var windowseats=req.body.windowseats;
            var class_of_service=req.body.class_of_service;
            console.log(Number(adults)+Number(children));
            console.log(flightname);
            if(Number(adults)+Number(children)+Number(seniorcitizens)>=Number(windowseats)){
                let nonwindowseats=Number(adults)+Number(children)+Number(seniorcitizens)-Number(windowseats);
               if(class_of_service=="economy"){
                console.log("economy");
                var w="ews";
                var nw="en";
                var ws=ew,nws=enw;
                var wcost=4753,cost=4556;
                console.log(ew);
                console.log(ws);
               }
               else if(class_of_service=="premium-economy"){
                var w="epw";
                var nw="epn";
                var ws=pew,nws=penw;
                var wcost=5025,cost=4825;
               }
               else if(class_of_service=="business"){
                var w="bw";
                var nw="bn";
                var ws=bw,nws=bnw;
                var wcost=5732,cost=5532;
               }
               else{
                var w="fws";
                var nw="fn";
                var ws=fw,nws=fnw;
                var wcost=6320,cost=6095;
               }
               console.log(ws);
               if(Number(windowseats)>Number(ws) || Number(nonwindowseats)>Number(nws)){
                console.log("non window seats not available!");
               }
               else{
                console.log(windowseats);
                console.log(nonwindowseats);
                let k=Number(ws)-Number(windowseats),j=Number(nws)-Number(nonwindowseats);
                  connection.query(`update seats set ${w}="${k}" ,${nw}="${j}" where source=? and destination=? and flight_name=? and date=?`,[source,destination,flightname,date],(err,result)=>{
                     if(err) throw err;
                     else{console.log("successfully updated!");
                     var total_fare=Number(windowseats)*Number(wcost)+Number(nonwindowseats)*Number(cost)-Number(seniorcitizens)*200-Number(children)*300;
                     res.render('payment',{total_fare:total_fare});
                     app.post('/pay',function(req,res){
                        var payment=req.body.amount;
                        console.log(total_fare);
                        console.log(payment);
                        if(payment==total_fare){
                            var pnr_no=Math.floor(Math.random()*10000000000);
                            console.log(pnr_no);
                console.log(class_of_service);
                            console.log(windowseats);
                            console.log(nonwindowseats);
                            console.log(flightname);
                console.log(date);
                            connection.query(`insert into confirmation values(?)`,[[pnr_no,class_of_service,windowseats,nonwindowseats,flightname,date]],(err,result)=>{
                                 if(err) throw err;
                                 else{console.log("successfully inserted!");}
                            });
                        res.render('pay',{message:"YOUR PAYMENT IS SUCCESSFUL",pnr:pnr_no});
                        }
                        else{
                            res.render('welcome',{message:"YOUR AMOUNT IS NOT SUFFICIENT!"}); 
                        }
                     });
                    }
                  });
               }
               
            }
            else{
                console.log("seats choosen are greater than choosen !");
                res.render('welcome',{message:"NO OF WINDOW SEATS CHOOSEN ARE GREATER THAN THE REQUIRED!"});
            }
         });

      }
    });
});
app.get('/login',function(req,res){
    res.render('login');});
app.get('/cancellation',function(req,res){
    res.render('cancellation');});
app.get('/home',function(req,res){
            res.render('home');});
app.get('/contact',function(req,res){
        res.render('contact');});
app.get('/about',function(req,res){
        res.render('about.ejs');});
app.post('/update',function(req,res){
    var ews=20,en=40,fws=10,fn=15,epw=10,epn=20,bw=10,bn=20,totalseats=145,fare=4556;
    var flightname=req.body.flightname;
    var source=req.body.from;
    var destination=req.body.to;
    var date=req.body.date;
    var time=req.body.time;
    connection.query('insert into flight_info values(?)',[[source,destination,flightname,date,time,fare]],(err,result)=>{
      if (err){
        // res.render('welcome',{message:"THERE IS NO SUCH FLIGHT IN THE DATABASE!"});
        throw err;
      }
      else{
        console.log("successfully inserted into flight_info");
        connection.query(`insert into seats values(?)`,[[source,destination,flightname,date,time,totalseats,ews,en,fws,fn,epw,epn,bw,bn]],(err,result)=>{
            if(err)  throw err;
            else{console.log("successfully inserted into seats");
            res.render('welcome',{message:"SUCCESSFULLY inserted into FLIGHT DATABASE!"});
        }
        });
      }
    } );
});
app.post('/cancellation',function(req,res){
    var pnr_no=req.body.pnr;
    console.log(pnr_no);
    connection.query(`select * from confirmation where pnr="${pnr_no}"`,function(err,result){
        if(err) res.render('welcome',{message:"PNR number does not match!"});
        var fn=result[0].flightname;
        var date=result[0].date;
        var clas=result[0].class;
        var windowseats=result[0].windowseats;
        var nonseats=result[0].nonwindowseats;
        console.log(clas);
        console.log(fn);
        console.log(date);
        if(clas=="economy"){var w="ews",nw="en";}
        else if(clas=="premium-economy"){var w="epw",nw="epn";}
        else if(clas=="business"){var w="bw",nw="bn";}
        else{var w="fws",nw="fn";}
        console.log(w);
        connection.query(`select ${w},${nw} from seats where flight_name=? and date=?`,[fn,date],function(err,result){
            console.log(result);
           var ws=result[0][w];
           var ns=result[0][nw];
           var window=Number(windowseats)+Number(ws);
           console.log(window);
           var nonwindow=Number(nonseats)+Number(ns);
           connection.query(`update seats set ${w}="${window}" ,${nw}="${nonwindow}" where flight_name=? and date=?`,[fn,date],(err,result)=>{
            if(err) throw err;
            else{
                connection.query(`delete from confirmation where pnr=${pnr_no}`,(err,result)=>{
                    if(err) throw err;
                    else{console.log("deleted from confirmation!");}
                })
                console.log("successfully cancelled");
                res.render('welcome',{message:"Booking was Successfully Cancelled!"});
            }
           });
        });
    
    });
});
app.post('/delete',function(req,res){
    var flightname=req.body.flightname;
    var source=req.body.from;
    var destination=req.body.to;
    var date=req.body.date;
    var time=req.body.time;
    console.log(flightname);
    connection.query(`delete from flight_info where source=? and destination=? and date=? and time=? and flight_name=?`,[source,destination,date,time,flightname],(err,result)=>{
      if (err){
        res.render('welcome',{message:"THERE IS NO SUCH FLIGHT IN THE DATABASE!"});
      }
      else{
        console.log("successfully deleted from flight_info");
        connection.query(`delete from seats where source=? and destination=? and date=? and time=? and flight_name=?`,[source,destination,date,time,flightname],(err,result)=>{
            if(err)  throw err;
            else{console.log("successfully deleted from seats");
            res.render('welcome',{message:"SUCCESSFULLY DELETED FLIGHT FROM THE DATABASE!"});
        }
        });
      }
    } );
});
app.post('/login',encoder,function(req,res,next){
    var username=req.body.useremail;
    var password=req.body.password;
    console.log(req.body);
    connection.query(`select * from user_login where user_email="${username}" and user_password="${password}"`,function(error,results){
        console.log("you are in");
        console.log(results);
        console.log(results.length);
        if(results.length>0){
            console.log("yes");
            res.redirect("/welcome");
            //res.sendFile(__dirname+"/home.html");
        }
        else{
            res.redirect('/login');
        }
        res.end();
    })
});
app.post('/admin_login',encoder,function(req,res,next){
    var username=req.body.username;
    var password=req.body.password;
    console.log(req.body);
        if(username=='admin' && password=='admin@123'){
            console.log("admin entered");
            res.render('makechoice');
        }
        else{
            res.render('welcome',{message:"Your email or password does not match! Please try again"});
        }
        //res.end();
    });
app.post('/searchflight',(req,res)=>{
    var from=req.body.from;
    var to=req.body.to;
    var date=req.body.date;
    console.log("yes");
    connection.query('select * from flight_info where source=? and destination=? and date=?',[from,to,date],(err,result)=>{
        console.log(result);
        res.render('booking',{result:result,from:from,to:to,date:date});
    });
});
app.post('/register',(req,res)=>{
    let firstname=req.body.firstname;
    let lastname=req.body.lastname;
    let mail=req.body.email;
    let mob=req.body.mobile;
    let pass=req.body.password;
    connection.query(`select * from user_login where user_email="${mail}" and user_password="${pass}"`,function(error,results){
        if(results.length>0){
            res.render('welcome',{message:"Your email or password already exist! Please try again"});
        }
        else{
            connection.query('select count(*) from user_login',function(err,data){
                if(err) throw err;
                else{
                    console.log(data.length);
                    console.log(data);
                    console.log(data[0]);
                }
            });
            
            connection.query('insert into user_login values(?)',[[mail,pass,firstname,lastname,mob]],(err)=>{
                if(err) throw err;
                else{
                    console.log('entered');
                    res.render('welcome',{message:"You are Successfully Registered!....Login now to continue!"});
                    //res.sendFile(__dirname+"/login.html");
                }
            });
            
        }
    });
    
});
app.get("/welcome",function(req,res){
    res.render('welcome',{message:"welcome! your login is successful..."});
})

app.listen(4600);