import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import Card from './components/Card'
import Navbar from './components/Navbar'
import IntroHeroLaunch from './components/IntroHeroLaunch'


function App() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        if (!db) {
          throw new Error('Firestore database connection not established');
        }
        
        const recipesRef = collection(db, 'recipes');
        const querySnapshot = await getDocs(recipesRef);
        const recipesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecipes(recipesData);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    fetchRecipes();
  }, []);

  console.log('Current recipes state:', recipes);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-tasty-background p-8">
        <div className="max-w-7xl mx-auto">


        <IntroHeroLaunch />



          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, index) => (
              <Card
                key={index}
                title={recipe.title}
                description={recipe.description}
                image={recipe.image}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default App