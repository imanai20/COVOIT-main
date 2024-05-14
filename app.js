import { fileURLToPath } from 'url';
// Configuration du middleware pour analyser les données du formulaire 


import path from 'path';
import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { body, validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;
const uri = "mongodb+srv://Ervin_Goby:gQoHIrAEiGNTBQPc@convoiturage.b2nzzl5.mongodb.net/?retryWrites=true&w=majority&appName=Convoiturage";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}
// Configuration du middleware pour analyser les données du formulaire
app.use(express.urlencoded({ extended: true }));

run().catch(console.dir);

app.post('/SignUpC', async (req, res) => {
  const { nom, prenom, date_naissance, lieu_naissance, voiture, matricule, email, password, num } = req.body;

  try {
    await client.connect();
    const database = client.db('convoiturages');
    const conducteursCollection = database.collection('SignUpConducteur');


    await conducteursCollection.insertOne({
      nom,
      prenom,
      date_naissance,
      lieu_naissance,
      voiture,
      matricule,
      email,
      password,
      num
    });

    console.log('Nouveau conducteur ajouté à la base de données');

  } catch (error) {
    console.error('Erreur lors de l\'ajout du conducteur à la base de données :', error);
    res.status(500).send('Erreur lors de la création du compte conducteur');
  } finally {
    await client.close();
  }
});

app.post('/SignUpP', async (req, res) => {
  const { nom, prenom, date_de_naissance, lieu_de_naissance, numero_de_telephone, mail, mot_de_passe} = req.body;

  try {
    await client.connect();
    const database = client.db('convoiturages');
    const passagersCollection = database.collection('SignUpPassager');

    
    await passagersCollection.insertOne({
      nom,
      prenom,
      date_de_naissance,
      lieu_de_naissance,
      numero_de_telephone,
      mail,
      mot_de_passe
    });

    console.log('Nouveau passager ajouté à la base de données');

  } catch (error) {
    console.error('Erreur lors de l\'ajout du conducteur à la base de données :', error);
    res.status(500).send('Erreur lors de la création du compte conducteur');
  } finally {
    await client.close();
  }
});
app.post('/login', async (req, res) => {
  const { mail, mot_de_passe } = req.body;
  console.log('Données de connexion reçues :', { mail, mot_de_passe }); // Ajout d'un log de débogage

  try {
    await client.connect();
    const database = client.db('convoiturages');
    const passagersCollection = database.collection('SignUpPassager');

    const user = await passagersCollection.findOne({ mail: mail, mot_de_passe: mot_de_passe });
    console.log('Utilisateur trouvé dans la base de données :', user); 

    if (user) {
      
      res.redirect('/accueil');

      
    } else {
      res.status(401).send('Identifiants incorrects');
    }
  } catch (error) {
    console.error('Erreur lors de la connexion de l\'utilisateur :', error);
    res.status(500).send('Erreur lors de la connexion');
  } finally {
    await client.close();
  }
});

app.post('/login1', async (req, res) => {
  const { email, password } = req.body;
  console.log('Données de connexion reçues :', { email, password }); // Ajout d'un log de débogage

  try {
    await client.connect();
    const database = client.db('convoiturages');
    const conducteursCollection = database.collection('SignUpConducteur');

    const user = await conducteursCollection.findOne({ email, password });
    console.log('Utilisateur trouvé dans la base de données :', user); // Ajout d'un log de débogage

    if (user) {
      
      res.redirect('/accueil');

    } else {
      res.status(401).send('Identifiants incorrects ');
    }
  } catch (error) {
    console.error('Erreur lors de la connexion de l\'utilisateur :', error);
    res.status(500).send('Erreur lors de la connexion');
  } finally {
    await client.close();
  }
});

app.post('/commander', async (req, res) => {
  const {trajet, prix , conducteur , Nombre_passager} = req.body;

  try {
    await client.connect();
    const database = client.db('convoiturages');
    const conmmanderCollection = database.collection('commander');


    await conmmanderCollection.insertOne({
     trajet,
     prix,
     conducteur,
     Nombre_passager
    });

    console.log('Nouvelles commandes');
    res.redirect('/commander');
  } catch (error) {
    console.error('Erreur lors de la commande', error);
    res.status(500).send('Erreur lors de la commande');
  } finally {
    await client.close();
  }

  
});
app.get('/commander', async (req, res) => {
  try {
    await client.connect();
    
    const database = client.db('convoiturages');
    const collection = database.collection('commander');

    
    const commander = await collection.find().toArray();

    
    res.render('pages/commander', { commander });
  } catch (error) {
    
    console.error('Erreur lors de la récupération de l\'historique des trajets :', error);
    res.status(500).send('Erreur lors de la récupération de l\'historique des trajets');
  } finally {
    
    await client.close();
  }
});


app.post('/supprimer-commande/:id', async (req, res) => {
  const commandeId = req.params.id;

  try {
    await client.connect();
    const database = client.db('convoiturages');
    const commanderCollection = database.collection('commander');

    const objectId = new ObjectId(commandeId); // Utilise ObjectId comme constructeur

    await commanderCollection.deleteOne({ _id: objectId });

    console.log('Commande supprimée');
    res.redirect('/commander'); // Redirection vers la liste des commandes après la suppression
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande', error);
    res.status(500).send('Erreur lors de la suppression de la commande');
  } finally {
    await client.close();
  }
});

// Ajoute cette route pour gérer la mise à jour d'une commande
app.post('/modifier-commande/:id', async (req, res) => {
  const commandeId = req.params.id;
  const { trajet, prix, conducteur, Nombre_passager } = req.body;

  try {
    await client.connect();
    const database = client.db('convoiturages');
    const conmmanderCollection = database.collection('commander');
    const objectId = new ObjectId(commandeId); // Utilise ObjectId comme constructeur
    await conmmanderCollection.updateOne(
      {_id: objectId },
      { $set: { trajet, prix, conducteur, Nombre_passager } }
    );

    console.log('Commande mise à jour');
    res.redirect('/commander'); // Redirection vers la liste des commandes après la mise à jour
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande', error);
    res.status(500).send('Erreur lors de la mise à jour de la commande');
  } finally {
    await client.close();
  }
});



app.get('/historique', async (req, res) => {
  try {
    await client.connect();
    
    
    const database = client.db('convoiturages');
    const collection = database.collection('historique');

    
    const historique = await collection.find().toArray();

    
    res.render('pages/historiqueTrajets', { historique });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des trajets :', error);
    res.status(500).send('Erreur lors de la récupération de l\'historique des trajets');
  } finally {
    await client.close();
  }
});


app.post('/contact', async (req, res) => {
  const {email,message} = req.body;

  try {
    await client.connect();
    const database = client.db('convoiturages');
    const messageCollection = database.collection('message');


    await messageCollection.insertOne({
    email,
    message
    });

    console.log('Nouveau Message');

  } catch (error) {
    console.error('Erreur lors de la commande', error);
    res.status(500).send('Erreur lors de la commande');
  } finally {
    await client.close();
  }
});

app.post('/payment', async (req, res) => {
  const {nom,Num,MM,AAAA,CVV} = req.body;

  try {
    await client.connect();
    const database = client.db('convoiturages');
    const paymentCollection = database.collection('payment');


    await paymentCollection.insertOne({
      nom,
      Num,
      MM,
      AAAA,
      CVV
    });

    console.log('Nouveau payment');
    res.redirect('/confircommande');

  } catch (error) {
    console.error('Erreur lors de la commande', error);
    res.status(500).send('Erreur lors de la commande');
  } finally {
    await client.close();
  }
});


// Configuration du moteur de modèle
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/pages/index.html');
   });
app.get('/chatbot', function (req, res) {
    res.sendFile(__dirname + '/views/pages/chatBot/public/index.html');
   });
app.get('/loginC', function (req, res) {
    res.sendFile(__dirname + '/views/pages/LoginConducteur.html');
   });
app.get('/loginP', function (req, res) {
    res.sendFile(__dirname + '/views/pages/LoginPassager.html');
   });
app.get('/SignUpP', function (req, res) {
    res.sendFile(__dirname + '/views/pages/SignUpPassager.html');
   });
app.get('/SignUpC', function (req, res) {
    res.sendFile(__dirname + '/views/pages/SignUpConducteur.html');
   });
app.get('/commander', function (req, res) {
    res.sendFile(__dirname + '/views/pages/Commander.ejs');
   });
app.get('/accueil', function (req, res) {
res.sendFile(__dirname + '/views/pages/Accueil.html');
   });
app.get('/reglement', function (req, res) {
    res.sendFile(__dirname + '/views/pages/Reglement.html');
       });
app.get('/maps', function (req, res) {
    res.sendFile(__dirname + '/views/pages/Maps.html');
       });
app.get('/historique', function (req, res) {
        res.sendFile(__dirname + '/views/pages/HistoriqueTrajets.ejs');
           });
app.get('/contact', function (req, res) {
      res.sendFile(__dirname + '/views/pages/contact.html');
        });
app.get('/payment', function (req, res) {
      res.sendFile(__dirname + '/views/pages/payment.html');
         });
app.get('/confircommande', function (req, res) {
  res.sendFile(__dirname + '/views/pages/ConfirmationCommande.html');
    });
// Gestion de la route non trouvée
app.use((req, res) => {
 res.status(404).send('Erreur 404: Page non trouvée');
});
// Démarrage du serveur
app.listen(port, () => {
 console.log(`Exemple d'application écoutant sur http://localhost:${port}`);
});