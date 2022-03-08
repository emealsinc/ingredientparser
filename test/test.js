var assert = require('assert');
var ing = require('../');

var checkMatch = function(source, expect){
  var sKeys = Object.keys(source),
      eKeys = Object.keys(expect),
      err,
      checkError = function(v, e){
        if(!v){
          err = e;
        }
      };

  if(sKeys.length!==eKeys.length){
    eKeys.forEach(function(key){
      if(sKeys.indexOf(key)===-1){
        err = 'Expected key '+JSON.stringify(key)+' not found';
      }
    });
    sKeys.forEach(function(key){
      if(eKeys.indexOf(key)===-1){
        err = 'Unexpected key '+JSON.stringify(key)+' found';
      }
    });
  }
  if(!err){
    eKeys.forEach(function(key){
      if(!err){
        checkError(sKeys.indexOf(key)>-1, 'Invalid expected '+JSON.stringify(key)+' key not found');
        if(typeof(expect[key])==='object'&&typeof(source[key])==='object'){
          checkMatch(source[key], expect[key]);
        }else{
          checkError(source[key]===expect[key], 'Invalid expected '+JSON.stringify(expect[key])+' but got '+JSON.stringify(source[key])+' for '+key);
        }
      }
    });
  }
  return err||true;
};

describe('Ingredient Parser', function(){
  describe('The Basics', function(){
    var testCases = {
      '1 Cup Flour': {
        amountMin: '1',
        unit: 'Cup',
        name: 'Flour'
      },
      '1 cups Flour': {
        amountMin: '1',
        unit: 'Cup',
        name: 'Flour'
      },
      '1/4 Cup flour': {
        amountMin: '1/4',
        unit: 'Cup',
        name: 'flour'
      },
      '1/4 cups flour': {
        amountMin: '1/4',
        unit: 'Cup',
        name: 'flour'
      },
      '1 large egg': {
        amountMin: '1',
        unit: 'Large',
        name: 'egg'
      },
      '1 tsp flour': {
        amountMin: '1',
        unit: 'Teaspoon',
        name: 'flour'
      },
      '1 pinch salt (optional)': {
        amountMin: '1',
        unit: 'Pinch',
        name: 'salt',
        optional: true
      },
      '1 pinch salt optional': {
        amountMin: '1',
        unit: 'Pinch',
        name: 'salt',
        optional: true
      },
      'salt to taste': {
        toTaste: true,
        name: 'salt'
      },
      'optional salt optional to taste': {
        optional: true,
        name: 'salt',
        toTaste: true
      },
      'a pinch of salt to taste': {
        unit: 'Pinch',
        name: 'salt',
        toTaste: true,
        amountMin: "1"
      },
      'a little salt to taste': {
        unit: 'Little',
        name: 'salt',
        toTaste: true
      },
      '1 lb carrots (diced)': {
        amountMin: "1",
        unit: "Pound",
        prep: "diced",
        name: "carrots"
      },
      '1 lb (diced) carrots': {
        amountMin: "1",
        unit: "Pound",
        prep: "diced",
        name: "carrots"
      },
      '1 lb carrots (diced small)': {
        amountMin: "1",
        unit: "Pound",
        prep: "diced small",
        name: "carrots"
      },
      '1 lb (diced small) carrots': {
        amountMin: "1",
        unit: "Pound",
        prep: "diced small",
        name: "carrots"
      },
      '1 to 2 Cups salt': {
        amountMin: {
          min: '1',
          max: '2'
        },
        unit: 'Cup',
        name: 'salt'
      },
      '1to2 Cups salt': {
        amountMin: {
          min: '1',
          max: '2'
        },
        unit: 'Cup',
        name: 'salt'
      },
      '1-2 Cups salt': {
        amountMin: {
          min: '1',
          max: '2'
        },
        unit: 'Cup',
        name: 'salt'
      },
      '1 - 2 Cups salt': {
        amountMin: {
          min: '1',
          max: '2'
        },
        unit: 'Cup',
        name: 'salt'
      },
      '1 oz of flour by weight': {
        amountMin: '1',
        unit: 'Ounce',
        byWeight: true,
        name: 'flour'
      },
      '1oz by weight of flour': {
        amountMin: '1',
        unit: 'Ounce',
        byWeight: true,
        name: 'flour'
      },
      '1oz flour by weight': {
        amountMin: '1',
        unit: 'Ounce',
        byWeight: true,
        name: 'flour'
      },
      '1-2oz of flour by weight': {
        amountMin: {
          min: '1',
          max: '2'
        },
        unit: 'Ounce',
        byWeight: true,
        name: 'flour'
      },
      'salt and pepper to taste': {
        name: 'salt and pepper',
        toTaste: true
      },
      '1 bottle ketchup': {
        amountMin: '1',
        package: 'Bottle',
        name: 'ketchup'
      },
      '2 teaspoons toasted sesame oil, divided': {
        amountMin: '2',
        unit: 'Teaspoon',
        prep: 'divided',
        name: 'toasted sesame oil'
      },
      '2 tsp toasted sesame oil': {
        amountMin: '2',
        unit: 'Teaspoon',
        name: 'toasted sesame oil'
      },
      '1/4 cup chopped green onion': {
        amountMin: '1/4',
        unit: 'Cup',
        prep: 'chopped',
        name: 'green onion'
      },
      '2 tablespoons minced garlic': {
        amountMin: '2',
        unit: 'Tablespoon',
        prep: 'minced',
        name: 'garlic'
      },
      '1 cup (190g) dried green lentils': {
        amountMin: '1',
        unit: 'Cup',
        prep: 'dried',
        name: 'green lentils'
      },
      '1/2 cup grated Parmesan cheese': {
        amountMin: '1/2',
        unit: 'Cup',
        prep: 'grated',
        name: 'Parmesan cheese'
      },
      '1/2 cup frozen corn, thawed': {
        amountMin: '1/2',
        unit: 'Cup',
        prep: 'thawed',
        name: 'frozen corn'
      },
      '1.5 tbsp cider vinegar': {
        amountMin: '1.5',
        unit: 'Tablespoon',
        name: 'cider vinegar'
      },
      '8 tablespoons unsalted butter, frozen': {
        amountMin: '8',
        unit: 'Tablespoon',
        name: 'unsalted butter',
        prep: 'frozen'
      },
      '1 pound shrimp, peeled and deveined': {
        amountMin: '1',
        unit: 'Pound',
        name: 'shrimp',
        prep: 'peeled and deveined'
      },
      '2 tbsp tomato paste': {
        amountMin: '2',
        unit: 'Tablespoon',
        name: 'tomato paste'
      },
      '2 garlic cloves, minced': {
        amountMin: '2',
        name: 'garlic cloves',
        prep: 'minced'
      },
      '1/2 cup (120g) ketchup': {
        amountMin: '1/2',
        unit: 'Cup',
        name: 'ketchup'
      },
      '4 cups unbleached all-purpose flour': {
        amountMin: '4',
        unit: 'Cup',
        prep: 'unbleached',
        name: 'all-purpose flour'
      },
      '1 tbsp apple cider vinegar': {
        amountMin: '1',
        unit: 'Tablespoon',
        name: 'apple cider vinegar'
      },
      '2 tablespoons vegetable oil, divided': {
        amountMin: '2',
        unit: 'Tablespoon',
        name: 'vegetable oil',
        prep: 'divided'
      },
      '1 tsp chili garlic paste  ($0.05)': {
        amountMin: '1',
        unit: 'Teaspoon',
        name: 'chili garlic paste'
      },
      '1 pound flank steak, thinly sliced': {
        amountMin: '1',
        unit: 'Pound',
        name: 'flank steak',
        prep: 'thinly sliced'
      },
      '1/2 cup plain yogurt*': {
        amountMin: '1/2',
        unit: 'Cup',
        name: 'plain yogurt'
      },
      'Sliced scallions (for serving)': {
        prep: 'sliced',
        name: 'scallions'
      },
      'Kosher salt': {
        name: 'Kosher salt'
      },
      '2 tablespoons vegetable oil, divided': {
        amountMin: '2',
        unit: 'Tablespoon',
        name: 'vegetable oil',
        prep: 'divided'
      },
      '1 tablespoon grated peeled ginger': {
        amountMin: '1',
        unit: 'Tablespoon',
        name: 'ginger',
        prep: 'grated peeled'
      },
      '1 garlic clove, grated': {
        amountMin: '1',
        name: 'garlic clove',
        prep: 'grated'
      },
      '¼ pear, grated': {
        amountMin: '¼',
        name: 'pear',
        prep: 'grated'
      },
      '1 bay leaf': {
        amountMin: '1',
        name: 'bay leaf'
      },
      '6 sprigs flat-leaf parsley': {
        amountMin: '6',
        unit: 'Sprig',
        name: 'flat-leaf parsley'
      },
      '1 head of garlic, halved crosswise': {
        amountMin: '1',
        unit: 'Head',
        name: 'garlic',
        prep: 'halved crosswise'
      },
      '1 small fennel bulb, cut into 1" pieces': {
        amountMin: '1',
        unit: 'Small',
        name: 'fennel bulb',
        prep: 'cut into 1" pieces'
      },
      '2 large carrots, peeled, cut into 1" pieces': {
        amountMin: '2',
        unit: 'Large',
        name: 'carrots',
        prep: 'peeled cut into 1" pieces'
      },
      '10 celery stalks, cut into 1" pieces': {
        amountMin: '10',
        unit: 'Stalk',
        name: 'celery',
        prep: 'cut into 1" pieces'
      },
      
      '1/2 tsp salt ($0.02)': {
        amountMin: '1/2',
        unit: 'Teaspoon',
        name: 'salt'
      },
      '2 medium onions, unpeeled, cut into 1" pieces': {
        amountMin: '2',
        unit: 'Medium',
        name: 'onions',
        prep: 'unpeeled cut into 1" pieces'
      },
      '2 teaspoon crushed garlic': {
        amountMin: '2',
        unit: 'Teaspoon',
        name: 'garlic',
        prep: 'crushed'
      },
      '1 teaspoon chopped fresh parsley': {
        amountMin: '1',
        unit: 'Teaspoon',
        name: 'parsley',
        prep: 'chopped fresh'
      },
      '3 stalks celery, chopped': {
        amountMin: '3',
        unit: 'Stalk',
        name: 'celery',
        prep: 'chopped'
      },
      '2 1/2 ounces fresh spinach': {
        amountMin: '2 1/2',
        unit: 'Ounce',
        name: 'spinach',
        prep: 'fresh'
      },
      '1/2 pound fresh bean sprouts': {
        amountMin: '1/2',
        unit: 'Pound',
        name: 'bean sprouts',
        prep: 'fresh'
      },
      '1 cup chopped green onions': {
        amountMin: '1',
        unit: 'Cup',
        name: 'green onions',
        prep: 'chopped'
      },
      '1/2 cup chopped red bell pepper': {
        amountMin: '1/2',
        unit: 'Cup',
        name: 'red bell pepper',
        prep: 'chopped'
      },
      '1/2 cup chopped green bell pepper': {
        amountMin: '1/2',
        unit: 'Cup',
        name: 'green bell pepper',
        prep: 'chopped'
      },
      '1 cup fresh sliced mushrooms': {
        amountMin: '1',
        unit: 'Cup',
        name: 'mushrooms',
        prep: 'fresh sliced'
      },
      // '1/2 (10 ounce) can tomato sauce': {
      //   amountMin: '1/2',
      //   unit: '10 ounce can',
      //   name: 'tomato sauce'
      // },
      '1/2 cup coarsely chopped pumpkin seeds': {
        amountMin: '1/2',
        unit: 'Cup',
        name: 'pumpkin seeds',
        prep: 'coarsely chopped'
      },
      '2 eggs': {
        amountMin: '2',
        name: 'eggs'
      },
      '1 cup unsalted butter, softened': {
        amountMin: '1',
        unit: 'Cup',
        name: 'unsalted butter',
        prep: 'softened'
      },
      '1/2 cup fresh spinach  ($0.08)': {
        amountMin: '1/2',
        unit: 'Cup',
        name: 'spinach',
        prep: 'fresh'
      },
      '1/4 cup shredded cheddar  ($0.25)': {
        amountMin: '1/4',
        unit: 'Cup',
        name: 'cheddar',
        prep: 'shredded'
      },
      '1 tsp chili garlic paste  ($0.05)': {
        amountMin: '1',
        unit: 'Teaspoon',
        name: 'chili garlic paste'
      },
      '1  small tortilla': {
        amountMin: '1',
        unit: 'Small',
        name: 'tortilla'
      },
      '1  large egg': {
        amountMin: '1',
        unit: 'Large',
        name: 'egg'
      },
      '1 1/2 cups (350mL) water': {
        amountMin: '1 1/2',
        unit: 'Cup',
        name: 'water'
      },
      '1/2 tsp cumin ($0.05)': {
        amountMin: '1/2',
        unit: 'Teaspoon',
        name: 'cumin'
      },
      // '2 cups (500 mL) water': {
      //   amountMin: '2',
      //   unit: 'Cup',
      //   name: 'water'
      // },
      '1 small onion, diced': {
        amountMin: '1',
        unit: 'Small',
        name: 'onion',
        prep: 'diced'
      }
      ,
      '1 small bell pepper, diced': {
        amountMin: '1',
        unit: 'Small',
        name: 'bell pepper',
        prep: 'diced'
      },
      '2-3 tbsp vegetable broth': {
        amountMin: {
          min: '2',
          max: '3'
        },
        unit: 'Tablespoon',
        name: 'vegetable broth'
      },
      '3/4 cup packed dark brown sugar': {
        amountMin: '3/4',
        unit: 'Cup',
        name: 'dark brown sugar',
        prep: 'packed'
      },
      '4 mangoes, peeled and cubed': {
        amountMin: '4',
        name: 'mangoes',
        prep: 'peeled and cubed'
      },
      '2 tablespoons minced garlic': {
        amountMin: '2',
        unit: 'Tablespoon',
        name: 'garlic',
        prep: 'minced'
      },
      '1/4 cup chopped green onion': {
        amountMin: '1/4',
        unit: 'Cup',
        name: 'green onion',
        prep: 'chopped'
      },
      '1 large  Red Bell Pepper (– thinly sliced)': {
        amountMin: '1',
        unit: 'Large',
        name: 'Red Bell Pepper',
        prep: 'thinly sliced'
      },
      '1/4 tsp dried oregano ($0.03)': {
        amountMin: '1/4',
        unit: 'Teaspoon',
        name: 'oregano',
        prep: 'dried'
      },
      '1 tablespoon olive oil': {
        amountMin: '1',
        unit: 'Tablespoon',
        name: 'olive oil'
      },
      '1/4 bunch parsley': {
        amountMin: '1/4',
        unit: 'Bunch',
        name: 'parsley'
      },
      '1 oz crumbled feta': {
        amountMin: '1',
        unit: 'Ounce',
        prep: 'crumbled',
        name: 'feta'
      },
      '1 large onion': {
        amountMin: '1',
        unit: 'Large',
        name: 'onion'
      },
      '2 stalks celery, including some leaves': {
        amountMin: '2',
        unit: 'Stalk',
        name: 'celery',
        prep: 'including some leaves'
      },
      '1 bunch green onions, chopped': {
        amountMin: '1',
        unit: 'Bunch',
        name: 'green onions',
        prep: 'chopped'
      },
      '8 sprigs fresh parsley': {
        amountMin: '8',
        unit: 'Sprig',
        name: 'parsley',
        prep: 'fresh'
      },
      '2 tablespoons minced garlic': {
        amountMin: '2',
        unit: 'Tablespoon',
        name: 'garlic',
        prep: 'minced'
      },
      '3 cups water': {
        amountMin: '3',
        unit: 'Cup',
        name: 'water'
      },
      '1 tablespoon chicken bouillon granules': {
        amountMin: '1',
        unit: 'Tablespoon',
        name: 'chicken bouillon granules'
      },
      '4 fresh poblano chilies': {
        amountMin: '4',
        name: 'poblano chilies',
        prep: 'fresh'
      },
      '10 (6 inch) corn tortillas': {
        amountMin: '10',
        name: 'corn tortillas'
      },
      '1 cup shredded mozzarella cheese': {
        amountMin: '1',
        unit: 'Cup',
        name: 'mozzarella cheese',
        prep: 'shredded'
      },
      '4 inch carrot ((4" = 10 cm))': {
        amountMin: '4',
        unit: 'Inch',
        name: 'carrot'
      },
      '½ Tbsp white sesame seeds (roasted/toasted) ((for topping))': {
        amountMin: '½',
        unit: 'Tablespoon',
        name: 'white sesame seeds',
        prep: 'roasted/toasted) ((for topping)'
      },
      '4 Tbsp Korean soy sauce': {
        amountMin: '4',
        unit: 'Tablespoon',
        name: 'Korean soy sauce'
      },
      '3 Tbsp brown sugar ((don’t substitute with honey as it burns easily))': {
        amountMin: '3',
        unit: 'Tablespoon',
        name: 'brown sugar',
        prep: '(dont substitute with honey as it burns easily)'
      },
      '8 cloves garlic ((8 cloves = 4 tsp))': {
        amountMin: '8',
        name: 'cloves garlic',
        prep: '(8 cloves = 4 tsp)'
      },
      '½  Asian pear ((half pear = 4 Tbsp))': {
        amountMin: '½',
        name: 'Asian pear'
      },
      'Freshly ground black pepper': {
        name: 'black pepper',
        prep: 'freshly ground'
      },
      '1 lb. boneless, skinless chicken breast ($3.99)': {
        amountMin: '1',
        unit: 'Pound',
        name: 'boneless, skinless chicken breast'
      },
      '1/4 tsp garlic powder ($0.02)	': {
        amountMin: '1/4',
        unit: 'Teaspoon',
        name: 'garlic powder'
      },
      '1/2 cup frozen corn kernels ($0.19)	': {
        amountMin: '1/2',
        unit: 'Cup',
        name: 'corn kernels',
        prep: 'frozen'
      },
      '1/3 cup sour cream ($0.56)	': {
        amountMin: '1/3',
        unit: 'Cup',
        name: 'sour cream'
      },
      '2 oz. queso fresco* ($0.40)		': {
        amountMin: '2',
        unit: 'Ounce',
        name: 'queso fresco'
      },
      '4 cups cooked rice for serving ($0.70)	': {
        amountMin: '4',
        unit: 'Cup',
        name: 'rice',
        prep: 'cooked'
      },
      'About 12 cups cold water, plus more as needed				': {
        amount: '12',
        unit: 'Cup',
        name: 'cold water',
        prep: 'plus more as needed',
      },
      '8 ounces daikon radish, peeled and cut into 2-inch matchsticks			': {
        amountMin: '8',
        unit: 'Ounce',
        name: 'daikon radish',
        prep: 'peeled and cut into 2-inch matchsticks'
      },
      '1/3 cup Korean red pepper powder': {
        amountMin: '1/3',
        unit: 'Cup',
        name: 'Korean red pepper powder'
      },
      '1/4 cup fish sauce': {
        amountMin: '1/4',
        unit: 'Cup',
        name: 'fish sauce'
      },
      '1 tablespoon minced garlic cloves (from 6 to 8 medium cloves)': {
        amountMin: '1',
        unit: 'Tablespoon',
        name: 'garlic cloves',
        prep: 'minced from 6 to 8 medium cloves'
      },
      '1/4 cup chopped green bell pepper': {
        amountMin: '1/4',
        unit: 'Cup',
        name: 'green bell pepper',
        prep: 'chopped'
      },
      '3/4 cup  Urad Dal (black matpe beans)': {
        amountMin: '3/4',
        unit: 'Cup',
        name: 'Urad Dal',
        prep: 'black matpe beans'
      },
      '8    garlic cloves, chopped': {
        amountMin: '8',
        name: 'garlic cloves',
        prep: 'chopped'
      },
      // '2  inches  gingerroot, chopped': {
      //   amountMin: '2',
      //   unit: 'Inch',
      //   name: 'gingerroot',
      //   prep: 'chopped'
      // },
      // '2    tomatoes, chopped (extra large tomatoes)': {
      //   amountMin: '2',
      //   name: 'tomatoes',
      //   prep: 'chopped extra large tomatoes'
      // },
      // 'salt': {
      //   name: 'salt'
      // },
      // '1/4 cup bite-size broccoli florets': {
      //   amountMin: '1/4',
      //   unit: 'Cup',
      //   name: 'broccoli florets',
      //   prep: 'bite-size'
      // },
      // '2 tablespoons chopped raw almonds': {
      //   amountMin: '2',
      //   unit: 'Tablespoon',
      //   name: 'raw almonds',
      //   prep: 'chopped'
      // },
      // '1/4 teaspoon coarse black pepper': {
      //   amountMin: '1/4',
      //   unit: 'Teaspoon',
      //   name: 'coarse black pepper'
      // },
      // '2 tablespoons fat free Italian-style dressing': {
      //   amountMin: '2',
      //   unit: 'Tablespoon',
      //   name: 'fat free Italian-style dressing'
      // },
      // '1 tablespoon extra-virgin olive oil': {
      //   amountMin: '1',
      //   unit: 'Tablespoon',
      //   name: 'extra-virgin olive oil'
      // },
      // '1 small onion, diced': {
      //   amountMin: '1',
      //   unit: 'Small',
      //   name: 'onion',
      //   prep: 'diced'
      // },
      '1 ½ cups white wine': {
        amountMin: '1 ½',
        unit: 'Cup',
        name: 'white wine'
      },
      // '✨1/4 cup real maple syrup': {
      //   amountMin: '1/4',
      //   unit: 'Cup',
      //   name: 'real maple syrup'
      // },
      // '✨1 1/2 teaspoons vanilla extract': {
      //   amountMin: '1 1/2',
      //   unit: 'Teaspoon',
      //   name: 'vanilla extract'
      // },
      '1½ cups extra crunchy peanut butter*': {
        amountMin: '1½',
        unit: 'Cup',
        name: 'extra crunchy peanut butter'
      },
      '1⅓ cups (10½ ounces) ice water': {
        amountMin: '1⅓',
        unit: 'Cup',
        name: 'ice water'
      },
      '1 (15.25 ounce) can whole kernel corn, drained': {
        amountMin: '1',
        package: 'Can',
        prep: 'drained',
        name: 'whole kernel corn'
      },
            
    };

    Object.keys(testCases).forEach(function(name){
      var expect = testCases[name];
      it('Should parse '+name, function(done){
        var res = ing.parse(name);
        var err = checkMatch(res, expect);
        if(typeof(err) === 'string'){
          assert(false, err);
        }
        done();
      });
    });
  });
});
