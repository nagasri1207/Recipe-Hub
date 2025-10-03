let userRecipes = JSON.parse(localStorage.getItem("userRecipes")) || [];

const API_KEY = "08699f97c758464bb07ed467f5d22e42"; 
const API_BASE_URL = "https://api.spoonacular.com/recipes";

async function getRecipeDetails(id) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/${id}/information?apiKey=${API_KEY}&includeNutrition=false`
    );
    if (!response.ok) throw new Error("Failed to fetch recipe details");
    return await response.json();
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    return null;
  }
}


async function searchRecipesAPI(searchTerm) {
  try {
    const searchUrl = `${API_BASE_URL}/complexSearch?apiKey=${API_KEY}&query=${encodeURIComponent(
      searchTerm
    )}&addRecipeInformation=true&fillIngredients=true&number=12`;

    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    return data.results.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      ingredients: recipe.extendedIngredients
        ? recipe.extendedIngredients.map((ing) => ing.original)
        : [],
      instructions:
        recipe.instructions ||
        recipe.summary?.replace(/<[^>]*>/g, "") ||
        "Instructions not available",
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      sourceUrl: recipe.sourceUrl,
    }));
  } catch (error) {
    console.error("Error searching recipes:", error);
    console.log("⚠️ Falling back to sample recipes...");
    return getSampleRecipes().filter(
      (recipe) =>
        recipe.ingredients.some((ing) =>
          ing.toLowerCase().includes(searchTerm.toLowerCase())
        ) || recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}

function getSampleRecipes() {
  return [
    {
      id: "sample-1",
      title: "Classic Chicken Curry",
      ingredients: [
        "2 lbs chicken breast, cubed",
        "1 large onion, diced",
        "3 tomatoes, chopped",
        "2 tbsp curry powder",
        "1 can coconut milk",
        "4 cloves garlic, minced",
        "1 inch ginger, grated",
      ],
      instructions:
        "Heat oil in a large pan. Add onions and cook until golden. Add garlic and ginger, cook for 1 min. Add chicken and brown. Add tomatoes + curry powder. Pour in coconut milk, simmer 20 min.",
      image:
        "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=300&fit=crop",
      readyInMinutes: 35,
      servings: 4,
    },
    {
      id: "sample-2",
      title: "Spaghetti Carbonara",
      ingredients: [
        "1 lb spaghetti",
        "4 large eggs",
        "6 strips bacon, diced",
        "1 cup parmesan cheese, grated",
        "1 tsp black pepper",
        "3 cloves garlic, minced",
      ],
      instructions:
        "Cook spaghetti. Fry bacon. Whisk eggs + cheese + pepper. Mix hot pasta with bacon, remove from heat, stir in egg mix. Serve immediately.",
      image:
        "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
      readyInMinutes: 25,
      servings: 4,
    },
    {
      id: "sample-3",
      title: "Vegetable Stir Fry",
      ingredients: [
        "2 cups broccoli florets",
        "1 red bell pepper, sliced",
        "2 carrots, julienned",
        "1 cup snap peas",
        "3 tbsp soy sauce",
        "3 cloves garlic, minced",
        "1 inch ginger, minced",
        "2 tbsp sesame oil",
      ],
      instructions:
        "Heat oil in wok. Add garlic + ginger. Stir-fry veggies. Add soy sauce + sesame oil. Serve with rice.",
      image:
        "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop",
      readyInMinutes: 15,
      servings: 3,
    },
  ];
}

async function searchRecipes() {
  const searchTerm = document.getElementById("searchInput").value.trim();
  const resultsDiv = document.getElementById("results");
  const loading = document.getElementById("loading");

  if (!searchTerm) {
    alert("Please enter an ingredient to search for!");
    return;
  }

  loading.style.display = "block";
  resultsDiv.innerHTML = "";

  try {
    const apiRecipes = await searchRecipesAPI(searchTerm);

    const userMatches = userRecipes.filter(
      (recipe) =>
        recipe.ingredients.some((ing) =>
          ing.toLowerCase().includes(searchTerm.toLowerCase())
        ) || recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const allMatches = [...apiRecipes, ...userMatches];

    loading.style.display = "none";
    displayRecipes(allMatches, searchTerm);
  } catch (error) {
    console.error("Search error:", error);
    loading.style.display = "none";
    displayError("Unable to search recipes. Please try again later.");
  }
}

function displayRecipes(recipes, searchTerm) {
  const resultsDiv = document.getElementById("results");

  if (recipes.length === 0) {
    resultsDiv.innerHTML = `
      <div class="no-results">
        <h3>No recipes found</h3>
        <p>Oh No!! Sorry we couldn't find any recipes containing "${searchTerm}". Try another ingredient or add your own recipe!</p>
      </div>`;
    return;
  }

  const recipesHTML = recipes
    .map(
      (recipe) => `
      <div class="recipe-card">
        <img src="${
          recipe.image ||
          "https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400&h=300&fit=crop"
        }" 
          alt="${recipe.title}" class="recipe-image" 
          onerror="this.src='https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400&h=300&fit=crop'">
        <div class="recipe-content">
          <h3 class="recipe-title">${recipe.title}</h3>

          ${
            recipe.readyInMinutes || recipe.servings
              ? `
              <div class="recipe-meta">
                ${
                  recipe.readyInMinutes
                    ? `<span class="meta-item">🕐 ${recipe.readyInMinutes} mins</span>`
                    : ""
                }
                ${
                  recipe.servings
                    ? `<span class="meta-item">🍽️ ${recipe.servings} servings</span>`
                    : ""
                }
              </div>`
              : ""
          }

          <div class="recipe-ingredients">
            <strong>Ingredients:</strong><br>
            ${recipe.ingredients
              .slice(0, 5)
              .map((ing) => `• ${ing}`)
              .join("<br>")}
            ${recipe.ingredients.length > 5 ? "<br>• ..." : ""}
          </div>

          <div class="recipe-instructions">
            <strong>Instructions:</strong><br>
            ${
              recipe.instructions.length > 200
                ? recipe.instructions.substring(0, 200) + "..."
                : recipe.instructions
            }
          </div>

          ${
            recipe.sourceUrl
              ? `<div class="recipe-link">
                  <a href="${recipe.sourceUrl}" target="_blank" rel="noopener noreferrer">
                    View Full Recipe →
                  </a>
                </div>`
              : ""
          }
        </div>
      </div>`
    )
    .join("");

  resultsDiv.innerHTML = recipesHTML;
}

function displayError(message) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `
    <div class="no-results">
      <h3>Oops! Something went wrong</h3>
      <p>${message}</p>
      <p><small>💡 Tip: Make sure your API key is valid or try again later.</small></p>
    </div>`;
}


function openModal() {
  document.getElementById("addRecipeModal").style.display = "block";
}

function closeModal() {
  document.getElementById("addRecipeModal").style.display = "none";
  document.getElementById("addRecipeForm").reset();
}


document.getElementById("addRecipeForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("recipeName").value.trim();
  const ingredients = document
    .getElementById("recipeIngredients")
    .value.trim()
    .split("\n")
    .filter((ing) => ing.trim());
  const instructions = document.getElementById("recipeInstructions").value.trim();
  const image = document.getElementById("recipeImage").value.trim();

  if (!name || !ingredients.length || !instructions) {
    alert("Please fill in all required fields!");
    return;
  }

  const newRecipe = {
    id: Date.now(),
    title: name,
    ingredients: ingredients.map((ing) => ing.trim()),
    instructions: instructions,
    image:
      image ||
      `https://via.placeholder.com/300x200/38ef7d/ffffff?text=${encodeURIComponent(
        name
      )}`,
  };

  userRecipes.push(newRecipe);
  localStorage.setItem("userRecipes", JSON.stringify(userRecipes));

  alert("Recipe added successfully!");
  closeModal();

  const currentSearch = document.getElementById("searchInput").value.trim();
  if (currentSearch) {
    searchRecipes();
  }
});


window.addEventListener("click", function (event) {
  const modal = document.getElementById("addRecipeModal");
  if (event.target === modal) {
    closeModal();
  }
});

document.getElementById("searchInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    searchRecipes();
  }
});


document.getElementById("results").innerHTML = `
  <div class="no-results">
    <h3>Welcome to Recipe Hub!</h3>
    <p>Search for recipes by entering an ingredient above, or add your own delicious recipes to share with the community.</p>
  </div>`;
