import express from "express";
import path from "path";
import mongoose from "mongoose";
import methodOverride from "method-override";
import Business from "./models/business.js";
import Review from "./models/review.js";
import { fileURLToPath } from 'url';


const url = 'mongodb+srv://woooseok:Sasmeye2@cluster0.fja7njd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.set("view engine", "ejs");

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.json());


app.get('/', (req, res) => {
    res.render('home')
});

app.get('/business', async(req, res) => {
    const business = await Business.find({});
    console.log(business);
    res.render('businesses/index', { business });
})
app.get('/business/new', (req, res) => {
    res.render('businesses/new');
});

app.post('/business', async (req, res) => {
    const newBusiness = new Business(req.body.business); 
    await newBusiness.save();
    res.redirect(`/business/${newBusiness._id}`);
});
app.get('/business/:id/update', async (req, res) => {

    const { id } = req.params;

    
    const business = await Business.findById(id);

    
    res.render('businesses/update', { business });
});
app.get('/business/:id', async (req, res) => {
    const business = await Business.findById(req.params.id).populate('reviews');
    res.render('businesses/show', { business });
});


app.put('/business/:id', async (req, res) => {
    const { id } = req.params;
    const updatedBusiness = await Business.findByIdAndUpdate(
        id, 
        { ...req.body.business },
        { new: true, runValidators: true }
    );
    res.redirect(`/business/${updatedBusiness._id}`);
});

app.delete('/business/:id', async (req, res) => {
    const { id } = req.params;
    await Business.findByIdAndDelete(id);
    res.redirect('/business');
})

app.post('/business/:id/reviews', async (req, res) => {
    const { id } = req.params;

    const business = await Business.findById(id);

    const review = new Review(req.body.review);

    business.reviews.push(review);

    await review.save();
    await business.save();

    const allReviews = await Review.find({ _id: { $in: business.reviews } });
    const average = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    business.averageRating = average;
    await business.save();

    res.redirect(`/business/${business._id}`);
})

app.delete('/business/:id/reviews/:reviewId', async (req, res) => {
    const { id, reviewId } = req.params;

    const business= await Business.findById(id);
    business.reviews.pull(reviewId);
    
    if (business. reviews. length>0) {
        const allReviews = await Review.find({ _id: { $in: business.reviews } });
        const average= allReviews.reduce((sum,r) => sum+ r.rating,0) / allReviews.length;
        business.averageRating = average;
    } else {
        business.averageRating = 0;
    }

    await business.save();

    // await Review.findByIdAndDelete(reviewId);

    // await Business.findByIdAndUpdate(id, { $pull: { reviews: reviewId }});

    res.redirect(`/business/${id}`)
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})