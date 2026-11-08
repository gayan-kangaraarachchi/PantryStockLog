// Pantrylog app logic. Loaded by index.html.
(() => {
"use strict";
/* ---------- constants (stored values stay in English; only what's shown is translated) ---------- */
const UNITS=["pcs","pack","bottle","can","jar","kg","g","L","ml","bunch"];
const CATS=["Produce","Dairy & eggs","Meat & fish","Bakery","Pantry","Frozen","Drinks","Snacks","Household","Personal care","Other"];
// [en, fi, sv, category, unit, qty, min, target]
const STAPLES=[
  ["Milk","Maito","Mjölk","Dairy & eggs","L",2,1,3],["Eggs","Kananmunat","Ägg","Dairy & eggs","pcs",6,4,12],["Butter","Voi","Smör","Dairy & eggs","pack",1,1,2],
  ["Cheese","Juusto","Ost","Dairy & eggs","pack",1,1,2],["Bread","Leipä","Bröd","Bakery","pcs",1,1,2],["Bananas","Banaanit","Bananer","Produce","pcs",4,3,6],
  ["Tomatoes","Tomaatit","Tomater","Produce","pcs",4,2,6],["Onions","Sipulit","Lök","Produce","pcs",3,2,5],["Pasta","Pasta","Pasta","Pantry","pack",2,1,3],
  ["Rice","Riisi","Ris","Pantry","kg",1,0.5,2],["Coffee","Kahvi","Kaffe","Pantry","pack",1,1,2],["Olive oil","Oliiviöljy","Olivolja","Pantry","bottle",1,1,1],
  ["Toilet paper","Vessapaperi","Toalettpapper","Household","pack",1,1,2],["Dish soap","Astianpesuaine","Diskmedel","Household","bottle",1,1,1]
];

/* ---------- translations ---------- */
const LANGS={en:{locale:"en-GB",idx:0},fi:{locale:"fi-FI",idx:1},sv:{locale:"sv-SE",idx:2}};
const T={
en:{
  sync_cloud:"Shared · live",sync_local:"Saved on this device",loading:"Loading…",language:"Language",
  tab_list:"List",tab_stock:"Stock",tab_history:"History",sections:"Sections",
  confirm:"Tap again to confirm",
  err_quota:"Storage is full. Delete old lists from History to make room.",err_readonly:"You can view this pantry but not change it.",err_save:"Couldn't save. Check your connection and try again.",
  list_name:"Shopping list",
  toast_low_new:"{name} is low. Started a new list",toast_updated:"Updated {name} on your list",toast_low_added:"{name} is low. Added to {list}",toast_restocked:"{name} is stocked again. Removed from list",
  tick_first:"Tick what you bought first",
  added_to_stock:{one:"{n} item added to stock",other:"{n} items added to stock"},moved_new_list:"{n} moved to a new list",
  loading_list:"Loading your list…",
  low_title:{one:"{n} item is running low",other:"{n} items are running low"},and_more:"and {n} more",add_to_list:"Add to list",
  no_list_title:"No open shopping list",no_list_body:"Start one, or let Stock fill it for you: anything that drops below its minimum lands here automatically.",
  start_list:"Start a shopping list",stock_empty_go:"Your stock is empty. Go to {link} to add what you keep at home.",
  open_lists:"Open lists",open_started:"Open list · started {date}",rename:"Rename",basket_progress:"<b>{got} of {total}</b> in the basket",
  add_placeholder:"Add an item, e.g. Oat milk",item_name:"Item name",quantity:"Quantity",unit:"Unit",category:"Category",add:"Add",
  all_in_basket:"Everything is in the basket. Complete the list to add it to your stock.",
  list_empty:"This list is empty. Add items above, or lower an item's stock to add it automatically.",
  in_basket:"In the basket · {n}",complete_btn:"Complete list and add {n} to stock",complete_btn0:"Complete list",
  not_ticked_move:{one:"{n} item not ticked will move to a new list.",other:"{n} items not ticked will move to a new list."},
  another_list:"+ Start another list",delete_list:"Delete this list",
  put_back:"Put back",mark_bought:"Mark bought",low_stock_chip:"Low stock",at_home:"{q} {u} at home",new_to_stock:"New to stock",less:"Less",more:"More",remove:"Remove",
  loading_stock:"Loading your stock…",add_item_btn:"+ Item",stock_intro_title:"What do you keep at home?",
  stock_intro_body:"Add the things you buy regularly. Give each a minimum: when the slider drops below it, the item goes on your shopping list. Completed lists add what you bought back here.",
  add_staples:"Add {n} common staples",add_own:"Add my own item",
  n_items:{one:"{n} item",other:"{n} items"},n_low:"{n} low",all_stocked:"all stocked",search_stock:"Search stock",filter:"Filter",all:"All",low_n:"Low · {n}",
  nothing_low:"Nothing is low. Your pantry is stocked.",no_match:"No items match.",
  pill_out:"Out",pill_low:"Low",pill_ok:"In stock",on_list:"On list",use_one:"Use one: {name}",add_one:"Add one: {name}",stock_aria:"{name} in stock, {u}",
  minimum_q:"Minimum {q}",min_target:"Min {min} · Target {target} {u}",edit:"Edit",
  loading_history:"Loading history…",history_sub:"Every completed shopping list, newest first.",trips_in:"trips in {month}",items_month:"items this month",
  bought_x:"bought {n}×",most_bought:"most bought",n_bought:"{n} bought",n_not_found:"{n} not found",rc_item:"ITEM",rc_qty:"QTY",
  rc_lines:{one:"{n} LINE TO STOCK",other:"{n} LINES TO STOCK"},shop_again:"Shop this list again",delete:"Delete",
  no_history:"No completed lists yet. When you complete a shopping list, it's saved here and what you bought goes into Stock.",
  edit_item:"Edit item",new_item:"New item",close:"Close",f_name:"Name",f_placeholder:"e.g. Oat milk",f_qty:"In stock now",f_min:"Minimum",f_target:"Top up to (target)",
  f_help:"When stock goes below the minimum, the item is added to your open shopping list with enough to reach the target. With no open list, a new one is started.",
  save_changes:"Save changes",add_to_stock:"Add to stock",delete_item:"Delete item",deleted:"Deleted {name}",already_in_stock:"{name} is already in stock",added_name_stock:"Added {name} to stock",
  rename_list:"Rename list",list_name_aria:"List name",save_name:"Save name",
  backup_title:"Backup your stock",backup_cloud:"Your stock is saved online. Save a backup file now and then, or load one from another copy of the app.",
  backup_local:"Your stock lives only in this browser. Save a backup file to keep it safe or move it to another phone.",
  export:"Export stock",import:"Import stock",no_stock_export:"There's no stock to export yet",exported:{one:"Exported {n} item",other:"Exported {n} items"},
  save_failed:"Couldn't save the file here. Try again in a moment.",dl_blocked:"This browser blocked the download.",
  not_stock_file:"That file isn't a Pantrylog stock file.",all_already:"Everything in that file is already in your stock.",importing:"Importing stock…",
  imported:{one:"Imported {n} item",other:"Imported {n} items"},skipped:"{n} already here",
  list_deleted:"List deleted",added_low:{one:"Added {n} low item to the list",other:"Added {n} low items to the list"},
  staples_added:"Added {n} staples. Adjust the sliders to what you have",added_to_list:"Added {name} to {list}",copied:"Copied to your open list",removed_history:"Removed from history",
  cats:{},units:{}
},
fi:{
  sync_cloud:"Jaettu · ajan tasalla",sync_local:"Tallennettu tälle laitteelle",loading:"Ladataan…",language:"Kieli",
  tab_list:"Lista",tab_stock:"Varasto",tab_history:"Historia",sections:"Osiot",
  confirm:"Vahvista napauttamalla uudelleen",
  err_quota:"Tallennustila on täynnä. Poista vanhoja listoja historiasta.",err_readonly:"Voit katsoa tätä varastoa, mutta et muokata sitä.",err_save:"Tallennus epäonnistui. Tarkista yhteys ja yritä uudelleen.",
  list_name:"Ostoslista",
  toast_low_new:"{name} on vähissä. Uusi lista aloitettu",toast_updated:"{name} päivitetty listalle",toast_low_added:"{name} on vähissä. Lisätty listalle {list}",toast_restocked:"{name} on taas varastossa. Poistettu listalta",
  tick_first:"Merkitse ensin ostamasi tuotteet",
  added_to_stock:{one:"{n} tuote lisätty varastoon",other:"{n} tuotetta lisätty varastoon"},moved_new_list:"{n} siirretty uudelle listalle",
  loading_list:"Ladataan listaa…",
  low_title:{one:"{n} tuote on vähissä",other:"{n} tuotetta on vähissä"},and_more:"ja {n} muuta",add_to_list:"Lisää listalle",
  no_list_title:"Ei avointa ostoslistaa",no_list_body:"Aloita uusi lista tai anna varaston täyttää se: kaikki, mikä laskee alle minimin, lisätään tänne automaattisesti.",
  start_list:"Aloita ostoslista",stock_empty_go:"Varastosi on tyhjä. Lisää kotona pitämäsi tuotteet kohdassa {link}.",
  open_lists:"Avoimet listat",open_started:"Avoin lista · aloitettu {date}",rename:"Nimeä uudelleen",basket_progress:"<b>{got}/{total}</b> korissa",
  add_placeholder:"Lisää tuote, esim. kaurajuoma",item_name:"Tuotteen nimi",quantity:"Määrä",unit:"Yksikkö",category:"Kategoria",add:"Lisää",
  all_in_basket:"Kaikki on korissa. Viimeistele lista, niin tuotteet lisätään varastoon.",
  list_empty:"Lista on tyhjä. Lisää tuotteita yllä tai laske tuotteen varastomäärää, niin se lisätään automaattisesti.",
  in_basket:"Korissa · {n}",complete_btn:"Viimeistele lista ja lisää {n} varastoon",complete_btn0:"Viimeistele lista",
  not_ticked_move:{one:"{n} merkitsemätön tuote siirtyy uudelle listalle.",other:"{n} merkitsemätöntä tuotetta siirtyy uudelle listalle."},
  another_list:"+ Aloita toinen lista",delete_list:"Poista tämä lista",
  put_back:"Palauta",mark_bought:"Merkitse ostetuksi",low_stock_chip:"Vähissä",at_home:"{q} {u} kotona",new_to_stock:"Uusi varastoon",less:"Vähemmän",more:"Enemmän",remove:"Poista",
  loading_stock:"Ladataan varastoa…",add_item_btn:"+ Tuote",stock_intro_title:"Mitä pidät kotona?",
  stock_intro_body:"Lisää tuotteet, joita ostat säännöllisesti. Anna jokaiselle minimi: kun liukusäädin laskee sen alle, tuote lisätään ostoslistalle. Valmiit listat lisäävät ostetut tuotteet takaisin tänne.",
  add_staples:"Lisää {n} perustuotetta",add_own:"Lisää oma tuote",
  n_items:{one:"{n} tuote",other:"{n} tuotetta"},n_low:"{n} vähissä",all_stocked:"kaikkea on",search_stock:"Hae varastosta",filter:"Suodata",all:"Kaikki",low_n:"Vähissä · {n}",
  nothing_low:"Mikään ei ole vähissä. Varasto on kunnossa.",no_match:"Ei hakua vastaavia tuotteita.",
  pill_out:"Loppu",pill_low:"Vähissä",pill_ok:"Varastossa",on_list:"Listalla",use_one:"Käytä yksi: {name}",add_one:"Lisää yksi: {name}",stock_aria:"{name} varastossa, {u}",
  minimum_q:"Minimi {q}",min_target:"Min {min} · Tavoite {target} {u}",edit:"Muokkaa",
  loading_history:"Ladataan historiaa…",history_sub:"Kaikki valmiit ostoslistat, uusin ensin.",trips_in:"ostosreissua, {month}",items_month:"tuotetta tässä kuussa",
  bought_x:"ostettu {n}×",most_bought:"ostetuin",n_bought:"{n} ostettu",n_not_found:"{n} ei löytynyt",rc_item:"TUOTE",rc_qty:"MÄÄRÄ",
  rc_lines:{one:"{n} RIVI VARASTOON",other:"{n} RIVIÄ VARASTOON"},shop_again:"Osta tämä lista uudelleen",delete:"Poista",
  no_history:"Ei vielä valmiita listoja. Kun viimeistelet ostoslistan, se tallentuu tänne ja ostetut tuotteet siirtyvät varastoon.",
  edit_item:"Muokkaa tuotetta",new_item:"Uusi tuote",close:"Sulje",f_name:"Nimi",f_placeholder:"esim. kaurajuoma",f_qty:"Varastossa nyt",f_min:"Minimi",f_target:"Täydennä määrään (tavoite)",
  f_help:"Kun varasto laskee alle minimin, tuote lisätään avoimelle ostoslistalle tavoitemäärään asti. Jos avointa listaa ei ole, uusi lista aloitetaan.",
  save_changes:"Tallenna muutokset",add_to_stock:"Lisää varastoon",delete_item:"Poista tuote",deleted:"{name} poistettu",already_in_stock:"{name} on jo varastossa",added_name_stock:"{name} lisätty varastoon",
  rename_list:"Nimeä lista uudelleen",list_name_aria:"Listan nimi",save_name:"Tallenna nimi",
  backup_title:"Varmuuskopioi varasto",backup_cloud:"Varastosi tallennetaan verkkoon. Tallenna varmuuskopio silloin tällöin tai lataa se sovelluksen toisesta kopiosta.",
  backup_local:"Varastosi on tallessa vain tässä selaimessa. Tallenna varmuuskopio, jotta tiedot säilyvät tai voit siirtää ne toiseen puhelimeen.",
  export:"Vie varasto",import:"Tuo varasto",no_stock_export:"Vietävää varastoa ei vielä ole",exported:{one:"{n} tuote viety",other:"{n} tuotetta viety"},
  save_failed:"Tiedostoa ei voitu tallentaa. Yritä hetken päästä uudelleen.",dl_blocked:"Selain esti latauksen.",
  not_stock_file:"Tiedosto ei ole Pantrylogin varastotiedosto.",all_already:"Kaikki tiedoston tuotteet ovat jo varastossa.",importing:"Tuodaan varastoa…",
  imported:{one:"{n} tuote tuotu",other:"{n} tuotetta tuotu"},skipped:"{n} oli jo varastossa",
  list_deleted:"Lista poistettu",added_low:{one:"{n} vähissä oleva tuote lisätty listalle",other:"{n} vähissä olevaa tuotetta lisätty listalle"},
  staples_added:"{n} perustuotetta lisätty. Säädä liukusäätimet vastaamaan sitä, mitä sinulla on",added_to_list:"{name} lisätty listalle {list}",copied:"Kopioitu avoimelle listalle",removed_history:"Poistettu historiasta",
  cats:{"Produce":"Hedelmät ja vihannekset","Dairy & eggs":"Maitotuotteet ja munat","Meat & fish":"Liha ja kala","Bakery":"Leivät","Pantry":"Kuivatuotteet","Frozen":"Pakasteet","Drinks":"Juomat","Snacks":"Herkut ja naposteltavat","Household":"Kodintarvikkeet","Personal care":"Hygienia","Other":"Muut"},
  units:{pcs:"kpl",pack:"pkt",bottle:"pullo",can:"tölkki",jar:"purkki",L:"l",bunch:"nippu"}
},
sv:{
  sync_cloud:"Delad · live",sync_local:"Sparad på den här enheten",loading:"Laddar…",language:"Språk",
  tab_list:"Lista",tab_stock:"Förråd",tab_history:"Historik",sections:"Avsnitt",
  confirm:"Tryck igen för att bekräfta",
  err_quota:"Lagringen är full. Ta bort gamla listor i historiken.",err_readonly:"Du kan se det här förrådet men inte ändra det.",err_save:"Det gick inte att spara. Kontrollera anslutningen och försök igen.",
  list_name:"Inköpslista",
  toast_low_new:"{name} håller på att ta slut. En ny lista har skapats",toast_updated:"{name} uppdaterad på listan",toast_low_added:"{name} håller på att ta slut. Tillagd i {list}",toast_restocked:"{name} finns hemma igen. Borttagen från listan",
  tick_first:"Bocka först av det du har köpt",
  added_to_stock:{one:"{n} vara tillagd i förrådet",other:"{n} varor tillagda i förrådet"},moved_new_list:"{n} flyttade till en ny lista",
  loading_list:"Laddar listan…",
  low_title:{one:"{n} vara håller på att ta slut",other:"{n} varor håller på att ta slut"},and_more:"och {n} till",add_to_list:"Lägg till i listan",
  no_list_title:"Ingen öppen inköpslista",no_list_body:"Skapa en lista, eller låt förrådet fylla den åt dig: allt som går under sitt minimum hamnar här automatiskt.",
  start_list:"Skapa en inköpslista",stock_empty_go:"Ditt förråd är tomt. Gå till {link} och lägg till det du brukar ha hemma.",
  open_lists:"Öppna listor",open_started:"Öppen lista · skapad {date}",rename:"Byt namn",basket_progress:"<b>{got} av {total}</b> i korgen",
  add_placeholder:"Lägg till en vara, t.ex. havredryck",item_name:"Varans namn",quantity:"Antal",unit:"Enhet",category:"Kategori",add:"Lägg till",
  all_in_basket:"Allt ligger i korgen. Slutför listan för att lägga till varorna i förrådet.",
  list_empty:"Listan är tom. Lägg till varor ovan, eller sänk en varas mängd så läggs den till automatiskt.",
  in_basket:"I korgen · {n}",complete_btn:"Slutför listan och lägg {n} i förrådet",complete_btn0:"Slutför listan",
  not_ticked_move:{one:"{n} vara som inte är avbockad flyttas till en ny lista.",other:"{n} varor som inte är avbockade flyttas till en ny lista."},
  another_list:"+ Skapa en till lista",delete_list:"Ta bort listan",
  put_back:"Lägg tillbaka",mark_bought:"Markera som köpt",low_stock_chip:"Snart slut",at_home:"{q} {u} hemma",new_to_stock:"Ny i förrådet",less:"Mindre",more:"Mer",remove:"Ta bort",
  loading_stock:"Laddar förrådet…",add_item_btn:"+ Vara",stock_intro_title:"Vad brukar du ha hemma?",
  stock_intro_body:"Lägg till det du köper regelbundet. Ge varje vara ett minimum: när reglaget går under det hamnar varan på inköpslistan. Slutförda listor lägger tillbaka det du köpt här.",
  add_staples:"Lägg till {n} vanliga basvaror",add_own:"Lägg till egen vara",
  n_items:{one:"{n} vara",other:"{n} varor"},n_low:"{n} snart slut",all_stocked:"allt finns hemma",search_stock:"Sök i förrådet",filter:"Filtrera",all:"Alla",low_n:"Snart slut · {n}",
  nothing_low:"Inget håller på att ta slut. Förrådet är fyllt.",no_match:"Inga varor matchar.",
  pill_out:"Slut",pill_low:"Snart slut",pill_ok:"Finns hemma",on_list:"På listan",use_one:"Använd en: {name}",add_one:"Lägg till en: {name}",stock_aria:"{name} i förrådet, {u}",
  minimum_q:"Minimum {q}",min_target:"Min {min} · Mål {target} {u}",edit:"Redigera",
  loading_history:"Laddar historiken…",history_sub:"Alla slutförda inköpslistor, nyaste först.",trips_in:"inköpsturer i {month}",items_month:"varor denna månad",
  bought_x:"köpt {n}×",most_bought:"mest köpt",n_bought:"{n} köpta",n_not_found:"{n} hittades inte",rc_item:"VARA",rc_qty:"ANTAL",
  rc_lines:{one:"{n} RAD TILL FÖRRÅDET",other:"{n} RADER TILL FÖRRÅDET"},shop_again:"Handla listan igen",delete:"Ta bort",
  no_history:"Inga slutförda listor än. När du slutför en inköpslista sparas den här och det du köpt läggs i förrådet.",
  edit_item:"Redigera vara",new_item:"Ny vara",close:"Stäng",f_name:"Namn",f_placeholder:"t.ex. havredryck",f_qty:"Hemma nu",f_min:"Minimum",f_target:"Fyll på till (mål)",
  f_help:"När mängden går under minimum läggs varan till på den öppna inköpslistan med så mycket att målet nås. Finns ingen öppen lista skapas en ny.",
  save_changes:"Spara ändringar",add_to_stock:"Lägg till i förrådet",delete_item:"Ta bort vara",deleted:"{name} borttagen",already_in_stock:"{name} finns redan i förrådet",added_name_stock:"{name} tillagd i förrådet",
  rename_list:"Byt namn på listan",list_name_aria:"Listans namn",save_name:"Spara namn",
  backup_title:"Säkerhetskopiera förrådet",backup_cloud:"Ditt förråd sparas online. Spara en säkerhetskopia då och då, eller läs in en från en annan kopia av appen.",
  backup_local:"Ditt förråd finns bara i den här webbläsaren. Spara en säkerhetskopia för att skydda den eller flytta den till en annan telefon.",
  export:"Exportera förråd",import:"Importera förråd",no_stock_export:"Det finns inget förråd att exportera än",exported:{one:"{n} vara exporterad",other:"{n} varor exporterade"},
  save_failed:"Det gick inte att spara filen. Försök igen om en stund.",dl_blocked:"Webbläsaren blockerade nedladdningen.",
  not_stock_file:"Filen är inte en förrådsfil från Pantrylog.",all_already:"Allt i filen finns redan i förrådet.",importing:"Importerar förråd…",
  imported:{one:"{n} vara importerad",other:"{n} varor importerade"},skipped:"{n} fanns redan",
  list_deleted:"Listan borttagen",added_low:{one:"{n} vara som snart är slut tillagd i listan",other:"{n} varor som snart är slut tillagda i listan"},
  staples_added:"{n} basvaror tillagda. Ställ in reglagen efter vad du har",added_to_list:"{name} tillagd i {list}",copied:"Kopierad till din öppna lista",removed_history:"Borttagen från historiken",
  cats:{"Produce":"Frukt och grönt","Dairy & eggs":"Mejeri och ägg","Meat & fish":"Kött och fisk","Bakery":"Bröd","Pantry":"Skafferi","Frozen":"Fryst","Drinks":"Drycker","Snacks":"Snacks och godis","Household":"Hushåll","Personal care":"Hygien","Other":"Övrigt"},
  units:{pcs:"st",pack:"förp",bottle:"flaska",can:"burk",jar:"glas",L:"l",bunch:"knippe"}
}};
let LANG=(()=>{try{const v=localStorage.getItem("pantrylog.lang");return LANGS[v]?v:"en"}catch{return "en"}})();
const LOC=()=>LANGS[LANG].locale;
function t(key,vars={}){
  let s=T[LANG][key]??T.en[key]??key;
  if(typeof s==="object") s=(vars.n===1?s.one:s.other)??s.other;
  return String(s).replace(/\{(\w+)\}/g,(m,k)=>vars[k]??m);
}
const catLabel=c=>T[LANG].cats[c]||c;
const unitLabel=u=>T[LANG].units[u]||u;
// Typed category text → stored English key (accepts the label in any language)
function catFromLabel(v){
  v=String(v||"").trim(); if(!v) return "Other";
  const k=CATS.find(c=>[c,T.fi.cats[c],T.sv.cats[c]].some(x=>x&&x.toLowerCase()===v.toLowerCase()));
  return k||v;
}
function setLang(l){
  if(!LANGS[l]) return; LANG=l; try{localStorage.setItem("pantrylog.lang",l)}catch{}
  document.documentElement.lang=LOC().slice(0,2);
  document.querySelectorAll("[data-t]").forEach(el=>el.textContent=t(el.dataset.t));
  $("#lang").value=l; $("#lang").setAttribute("aria-label",t("language")); $("nav.tabs").setAttribute("aria-label",t("sections"));
  render();
}

/* ---------- category from item name (English, Finnish, Swedish). First match wins, so order matters. ---------- */
const CAT_RULES=[
  ["Frozen",/\b(frozen|ice ?cream|ice lolly|fish fingers|sorbet|glass\b|fryst)|pakaste|jäätelö/],
  ["Pantry",/\b(peanut butter|almond butter|coconut milk|coconut cream|stock cube|bouillon|broth|canned|tinned|soup|sauce|ketchup|mayo|mustard|pesto|paste\b|puree|black pepper|peppercorn|salt\b|spice|cinnamon|smoked paprika|paprika powder|cumin|curry|noodle|buljong|konserv|krydd|senap|majonnäs)|jordnötssmör|maapähkinävoi|kastike|liemikuutio|mauste|sinappi|majoneesi/],
  ["Drinks",/\b(juice|soda|cola|water\b|sparkling|beer|wine|cider|lemonade|energy drink|smoothie|kombucha|tonic|läsk|vin\b|vatten|saft|dricka)|mehu|olut|viini|limsa|siideri|kivennäisvesi|öl\b/],
  ["Household",/\b(dish|detergent|washing|laundry|toilet (paper|roll)|kitchen (roll|paper)|paper towel|bin bag|trash bag|rubbish bag|foil|cling film|baking paper|sponge|cleaner|bleach|softener|batter(y|ies)|light ?bulb|candle|napkin|diskmedel|tvättmedel|toalettpapper|hushållspapper|soppåsar|sopsäck|plastfolie|disksvamp|rengöring|servetter)|astianpesu|pyykki|vessapaperi|wc-paperi|talouspaperi|roskapussi|pesuaine|aluminiumfolie/],
  ["Personal care",/\b(shampoo|conditioner|soap|shower gel|body wash|toothpaste|toothbrush|deodorant|razor|lotion|sunscreen|tampon|sanitary|nappies|nappy|diaper|cotton|floss|mouthwash|shaving|hand cream|plaster|schampo|tandborste|rakhyvel|blöj|bomull)|hammastahna|hammasharja|saippua|deodorantti|vaippa|suihkusaippua|tandkräm|tvål/],
  ["Meat & fish",/\b(chicken|beef|pork|lamb|turkey|mince|steak|bacon|ham\b|sausage|salami|chorizo|pepperoni|meat|duck|veal|venison|fish|salmon|tuna|cod\b|haddock|trout|herring|mackerel|prawn|shrimp|seafood|mussel|sardine|anchov|crab|lobster|squid|kyckling|lamm|kalkon|färs|biff|skinka|korv|fisk|lax|torsk|sill|strömming|tonfisk)|kana|broileri|liha|nauta|possu|sika|kinkku|makkara|nakki|kala|lohi|silakka|silli|tonnikala|katkarap|köttfärs|kött|nötfärs|nötkött|fläsk|räk/],
  ["Snacks",/\b(chocolate|crisps|chips\b|candy|sweets|biscuit|cookie|popcorn|nuts\b|peanuts|cracker|pretzel|gum\b|snack|granola bar|choklad|godis|kex|kakor|nötter)|karkki|suklaa|sipsi|keksi|pähkinä/],
  ["Produce",/\b(apple|banana|orange|lemon|lime|grape|berr|strawberr|blueberr|raspberr|melon|watermelon|pear|peach|nectarine|plum|mango|pineapple|kiwi|avocado|tomato|potato|onion|shallot|garlic|carrot|cucumber|lettuce|salad|spinach|kale|cabbage|broccoli|cauliflower|bell pepper|pepper\b|peppers\b|chil(l)?i|mushroom|courgette|zucchini|aubergine|eggplant|celery|leek|ginger|herb|basil|parsley|coriander|cilantro|dill\b|mint\b|beetroot|beet|squash|pumpkin|sweetcorn|corn on|peas\b|bean sprout|fruit|veg|apelsin|citron|druv|jordgubb|hallon|lingon|persika|plommon|ananas|tomat|potatis|morot|morötter|gurka|sallad|spenat|blomkål|svamp|champinjon|ingefära|persilja|frukt|grönsak)|omena|banaani|appelsiini|sitruuna|tomaatti|peruna|sipuli|porkkana|kurkku|salaatti|marja|mustikka|mansikka|vadelma|puolukka|sieni|kaali|paprika|avokado|päärynä|äpple|banan|lök|blåbär|päron|kål|bär\b/],
  ["Bakery",/\b(bread|buns?\b|rolls?\b|bagel|baguette|croissant|tortilla|wraps?\b|pitta?|naan|muffin|cake|pastry|pastries|brioche|crispbread|rye|bulle|bullar|limpa|kaka)|leipä|sämpylä|pulla|näkkileipä|patonki|korvapuusti|bröd/],
  ["Dairy & eggs",/\b(milk|cheese|butter|yog(h)?urt|cream|eggs?\b|kefir|quark|skyr|feta|mozzarella|parmesan|cheddar|halloumi|ricotta|mascarpone|margarine|custard|yoghurt|fil\b|filmjölk|kvarg|keso|cr[eè]me fraiche)|maito|juusto|voi\b|jogurtti|kerma|kananmun|muna|piimä|viili|rahka|raejuusto|mjölk|ost\b|smör|grädde|ägg/],
  ["Pantry",/\b(pasta|spaghetti|macaroni|rice|flour|sugar|oil\b|vinegar|honey|jam\b|cereal|oats|porridge|muesli|granola|beans|lentil|chickpea|coffee|tea\b|cocoa|baking|yeast|stock|canned|tin\b|jar\b|nut butter|syrup|crackers?|spagetti|makaroner|ris\b|socker|olja|honung|sylt|flingor|havregryn|gryn|linser|kikärtor|kaffe|te\b|kakao)|riisi|jauho|sokeri|öljy|kahvi|tee\b|kaura|puuro|makaroni|hunaja|hillo|mjöl|vinäger|bönor|jäst/]
];
function guessCat(name){
  const n=String(name||"").toLowerCase().trim(); if(!n) return "Other";
  for(const [cat,re] of CAT_RULES) if(re.test(n)) return cat;
  return "Other";
}

/* ---------- helpers ---------- */
const $=(s,el=document)=>el.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const clone=o=>JSON.parse(JSON.stringify(o));
const num=v=>{const n=parseFloat(String(v??"").replace(",","."));return isFinite(n)?n:0};
const stepOf=u=>(u==="kg"||u==="L")?0.25:(u==="g"||u==="ml")?50:1;
const roundTo=(n,s)=>Math.round(n/s)*s;
const fq=n=>{n=Math.round(num(n)*100)/100;return n.toLocaleString(LOC(),{maximumFractionDigits:2})};
const dfmt=(d,o={day:"numeric",month:"short"})=>new Date(d).toLocaleDateString(LOC(),o);
const tfmt=d=>new Date(d).toLocaleTimeString(LOC(),{hour:"2-digit",minute:"2-digit"});
const norm=s=>String(s||"").trim().toLowerCase();
const TABS=["list","stock","history"];
const fromHash=()=>{const x=(location.hash||"").slice(1);return TABS.includes(x)?x:"list"};
const ls={get(k,f){try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
function toast(msg){document.querySelectorAll(".toast").forEach(t=>t.remove());const el=document.createElement("div");el.className="toast";el.setAttribute("role","status");el.textContent=msg;document.body.appendChild(el);setTimeout(()=>el.remove(),2600)}
function armed(btn,fn){
  if(btn.classList.contains("armed")){fn();return}
  const old=btn.textContent;btn.classList.add("armed");btn.textContent=t("confirm");
  setTimeout(()=>{if(btn.isConnected){btn.classList.remove("armed");btn.textContent=old}},3000);
}
const catOrder=(a,b)=>(CATS.indexOf(a)+100)%100-(CATS.indexOf(b)+100)%100;

/* ---------- state + storage ---------- */
const S={mode:"pending",items:[],lists:[],tab:fromHash(),q:"",filter:"all",listId:null,draft:{name:"",qty:"1",unit:"pcs",cat:"Other",catTouched:false},dragging:false,pendingRender:false};
const Store={
  db:null,
  async init(){
    let db=null; try{ if(window.claude?.use) db=await window.claude.use("db") }catch{}
    if(db){
      this.db=db; S.mode="cloud";
      db.collection("items").limit(1000).onSnapshot(q=>{S.items=q.docs.map(d=>d.data()).filter(Boolean);S.itemsLoaded=true;render()},e=>this.err(e));
      db.collection("lists").orderBy("createdAt","desc").limit(500).onSnapshot(q=>{S.lists=q.docs.map(d=>d.data()).filter(Boolean);S.listsLoaded=true;render()},e=>this.err(e));
    }else{
      S.mode="local"; S.items=ls.get("pantrylog.items",[]); S.lists=ls.get("pantrylog.lists",[]); S.itemsLoaded=S.listsLoaded=true;
    }
    render();
  },
  err(e){
    const c=e?.code;
    toast(c==="quota_exceeded"?t("err_quota"):c==="revoked"||c==="not_granted"?t("err_readonly"):t("err_save"));
  },
  async saveItem(it){
    it.updatedAt=Date.now();
    S.items=[...S.items.filter(x=>x.id!==it.id),it]; render();
    if(S.mode==="cloud"){try{await this.db.collection("items").doc(it.id).set(it)}catch(e){this.err(e)}}
    else ls.set("pantrylog.items",S.items);
  },
  async deleteItem(id){
    S.items=S.items.filter(x=>x.id!==id); render();
    if(S.mode==="cloud"){try{await this.db.collection("items").doc(id).delete()}catch(e){this.err(e)}}
    else ls.set("pantrylog.items",S.items);
  },
  async saveList(l){
    l.updatedAt=Date.now();
    S.lists=[l,...S.lists.filter(x=>x.id!==l.id)].sort((a,b)=>b.createdAt-a.createdAt); render();
    if(S.mode==="cloud"){try{await this.db.collection("lists").doc(l.id).set(l)}catch(e){this.err(e)}}
    else ls.set("pantrylog.lists",S.lists);
  },
  async deleteList(id){
    S.lists=S.lists.filter(x=>x.id!==id); render();
    if(S.mode==="cloud"){try{await this.db.collection("lists").doc(id).delete()}catch(e){this.err(e)}}
    else ls.set("pantrylog.lists",S.lists);
  }
};

/* ---------- derived ---------- */
const openLists=()=>S.lists.filter(l=>l.status==="open").sort((a,b)=>b.createdAt-a.createdAt);
const doneLists=()=>S.lists.filter(l=>l.status==="completed").sort((a,b)=>(b.completedAt||0)-(a.completedAt||0));
const currentList=()=>{const o=openLists();return o.find(l=>l.id===S.listId)||o[0]||null};
const itemById=id=>S.items.find(i=>i.id===id);
const itemByName=n=>S.items.find(i=>norm(i.name)===norm(n));
const level=it=>num(it.qty)<=0?"out":num(it.qty)<num(it.min)?"low":"ok";
const lowItems=()=>S.items.filter(i=>level(i)!=="ok");
const needFor=it=>{const s=stepOf(it.unit);return Math.max(s,roundTo(Math.max(num(it.target),num(it.min))-num(it.qty),s))};
const newListName=()=>t("list_name")+" · "+dfmt(new Date(),{weekday:"short",day:"numeric",month:"short"});
const makeList=(name)=>({id:uid("l"),name:name||newListName(),status:"open",createdAt:Date.now(),lines:[]});
const shortName=l=>l.name.split(" · ")[0];

/* ---------- core rules ---------- */
// Below minimum → put it on the open list (or start one). Back at/above minimum → take auto-added, unbought lines off again.
async function syncAuto(it,{quiet}={}){
  const lv=level(it);
  if(lv!=="ok"){
    let l=currentList(), created=false;
    const already=l&&l.lines.find(x=>x.itemId===it.id&&!x.done);
    if(already&&!already.auto) return;
    if(l&&l.lines.some(x=>x.itemId===it.id&&x.done)) return; // already in the basket
    if(!l){l=makeList();created=true}else l=clone(l);
    const need=needFor(it);
    const line=l.lines.find(x=>x.itemId===it.id&&!x.done);
    if(line){ if(num(line.qty)===need) return; line.qty=need; line.unit=it.unit; line.name=it.name; }
    else l.lines.push({id:uid("ln"),itemId:it.id,name:it.name,unit:it.unit,qty:need,done:false,auto:true,cat:it.cat||"Other"});
    await Store.saveList(l);
    if(!quiet) toast(created?t("toast_low_new",{name:it.name}):line?t("toast_updated",{name:it.name}):t("toast_low_added",{name:it.name,list:shortName(l)}));
  }else{
    for(const l0 of openLists()){
      const idx=l0.lines.findIndex(x=>x.itemId===it.id&&x.auto&&!x.done);
      if(idx>=0){const l=clone(l0);l.lines.splice(idx,1);await Store.saveList(l);if(!quiet)toast(t("toast_restocked",{name:it.name}))}
    }
  }
}
const qtyTimers={};
function setQty(id,q,{immediate}={}){
  const it0=itemById(id); if(!it0) return;
  const it={...it0,qty:Math.max(0,roundTo(num(q),stepOf(it0.unit)))};
  S.items=S.items.map(x=>x.id===id?it:x); render();
  clearTimeout(qtyTimers[id]);
  qtyTimers[id]=setTimeout(async()=>{const cur=itemById(id)||it;await Store.saveItem({...cur,qty:it.qty});await syncAuto({...cur,qty:it.qty})},immediate?0:450);
}
async function completeList(l0){
  const l=clone(l0), bought=l.lines.filter(x=>x.done), left=l.lines.filter(x=>!x.done);
  if(!bought.length){toast(t("tick_first"));return}
  const touched=[];
  for(const ln of bought){
    let it=(ln.itemId&&itemById(ln.itemId))||itemByName(ln.name);
    if(it){ it={...it,qty:roundTo(num(it.qty)+num(ln.qty),stepOf(it.unit))}; }
    else { const q=num(ln.qty)||1; it={id:uid("i"),name:ln.name,cat:ln.cat||guessCat(ln.name),unit:ln.unit||"pcs",qty:q,min:Math.min(1,q),target:q,createdAt:Date.now()}; }
    ln.itemId=it.id; await Store.saveItem(it); touched.push(it);
  }
  l.status="completed"; l.completedAt=Date.now(); l.lines=bought; l.missed=left.map(x=>({name:x.name,qty:x.qty,unit:x.unit}));
  await Store.saveList(l);
  let msg=t("added_to_stock",{n:bought.length});
  if(left.length){ const n=makeList(); n.lines=left.map(x=>({...x,id:uid("ln")})); await Store.saveList(n); S.listId=n.id; msg+=" · "+t("moved_new_list",{n:left.length}); }
  else S.listId=null;
  for(const it of touched) await syncAuto(it,{quiet:true});
  toast(msg);
}
function addLine(name,qty,unit,{toListId,auto,cat}={}){
  name=String(name||"").trim(); if(!name) return null;
  let l=openLists().find(x=>x.id===toListId)||currentList(); l=l?clone(l):makeList();
  const it=itemByName(name);
  const ex=l.lines.find(x=>!x.done&&norm(x.name)===norm(name));
  if(ex){ex.qty=num(ex.qty)+(num(qty)||1);ex.auto=false}
  else l.lines.push({id:uid("ln"),itemId:it?.id||null,name:it?.name||name,unit:unit||it?.unit||"pcs",qty:num(qty)||1,done:false,auto:!!auto,cat:cat||it?.cat||guessCat(name)});
  return l;
}

/* ---------- views ---------- */
const unitOpts=sel=>UNITS.map(u=>`<option value="${u}" ${u===sel?"selected":""}>${esc(unitLabel(u))}</option>`).join("");
function viewList(){
  if(!S.listsLoaded) return `<div class="empty">${t("loading_list")}</div>`;
  const opens=openLists(), l=currentList(), low=lowItems();
  const lowOff=l?low.filter(i=>!l.lines.some(x=>x.itemId===i.id)):low;
  const lowCard=lowOff.length?`<div class="card spread" style="background:var(--warn-soft);border-color:transparent">
      <div class="grow"><b>${t("low_title",{n:lowOff.length})}</b><div class="muted" style="font-size:13px">${lowOff.slice(0,4).map(i=>esc(i.name)).join(", ")}${lowOff.length>4?" "+t("and_more",{n:lowOff.length-4}):""}</div></div>
      <button class="btn sm" id="addLow">${t("add_to_list")}</button></div>`:"";
  if(!l){
    return `<div class="stack">
      <div><div class="eyebrow">${dfmt(new Date(),{weekday:"long",day:"numeric",month:"long"})}</div><h1>${t("no_list_title")}</h1>
      <p class="muted" style="margin:4px 0 0">${t("no_list_body")}</p></div>
      ${lowCard}
      <button class="btn primary block" id="newList">${t("start_list")}</button>
      ${!S.items.length&&S.itemsLoaded?`<div class="empty">${t("stock_empty_go",{link:`<a href="#stock">${t("tab_stock")}</a>`})}</div>`:""}
    </div>`;
  }
  const todo=l.lines.filter(x=>!x.done), got=l.lines.filter(x=>x.done);
  const pct=l.lines.length?Math.round(got.length/l.lines.length*100):0;
  const groups=new Map(); todo.forEach(x=>{const c=x.cat||"Other";if(!groups.has(c))groups.set(c,[]);groups.get(c).push(x)});
  const order=[...groups.keys()].sort(catOrder);
  return `<div class="stack">
    ${opens.length>1?`<div class="chips" role="group" aria-label="${t("open_lists")}">${opens.map(o=>`<button class="fchip" data-pick="${esc(o.id)}" aria-pressed="${o.id===l.id}">${esc(o.name.split(" · ").slice(-1)[0])} · ${o.lines.filter(x=>!x.done).length}</button>`).join("")}</div>`:""}
    <div class="spread" style="align-items:flex-end">
      <div class="grow"><div class="eyebrow">${t("open_started",{date:dfmt(l.createdAt)})}</div><h1>${esc(l.name)}</h1></div>
      <button class="btn sm ghost" id="renameList">${t("rename")}</button>
    </div>
    <div class="card stack" style="gap:8px">
      <div class="spread"><span style="font-size:14px" class="num">${t("basket_progress",{got:got.length,total:l.lines.length})}</span><span class="muted num" style="font-size:13px">${pct}%</span></div>
      <div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><b style="width:${pct}%"></b></div>
    </div>
    <form class="add-row" id="addForm" autocomplete="off">
      <input class="field" id="addName" list="itemNames" placeholder="${esc(t("add_placeholder"))}" value="${esc(S.draft.name)}" aria-label="${esc(t("item_name"))}">
      <input class="field num" id="addQty" inputmode="decimal" value="${esc(S.draft.qty)}" aria-label="${esc(t("quantity"))}" style="text-align:center">
      <select class="field" id="addUnit" aria-label="${esc(t("unit"))}">${unitOpts(S.draft.unit)}</select>
      <select class="field" id="addCat" aria-label="${esc(t("category"))}">${CATS.map(c=>`<option value="${esc(c)}" ${c===S.draft.cat?"selected":""}>${esc(catLabel(c))}</option>`).join("")}</select>
      <button class="btn primary" type="submit">${t("add")}</button>
    </form>
    ${lowCard}
    ${todo.length?order.map(c=>`<section class="card" style="padding-block:6px"><div class="eyebrow" style="padding-top:8px">${esc(catLabel(c))}</div><div class="lines">${groups.get(c).map(lineHtml).join("")}</div></section>`).join("")
      :`<div class="empty">${l.lines.length?t("all_in_basket"):t("list_empty")}</div>`}
    ${got.length?`<div class="basket-head"><div class="eyebrow">${t("in_basket",{n:got.length})}</div></div><section class="card" style="padding-block:6px"><div class="lines">${got.map(lineHtml).join("")}</div></section>`:""}
    <button class="btn primary block" id="completeBtn" style="min-height:50px;font-size:16px;white-space:normal" ${got.length?"":'aria-disabled="true"'}>${got.length?t("complete_btn",{n:got.length}):t("complete_btn0")}</button>
    ${got.length&&todo.length?`<p class="muted" style="margin:-4px 0 0;font-size:13px;text-align:center">${t("not_ticked_move",{n:todo.length})}</p>`:""}
    <div class="row" style="justify-content:center"><button class="btn ghost sm" id="newList">${t("another_list")}</button><button class="btn ghost sm danger" id="delList">${t("delete_list")}</button></div>
  </div>`;
}
function lineHtml(x){
  const it=x.itemId&&itemById(x.itemId), nm=esc(x.name);
  return `<div class="line ${x.done?"done":""}" data-line="${esc(x.id)}">
    <button class="tick" data-tick aria-label="${x.done?t("put_back"):t("mark_bought")}: ${nm}" aria-pressed="${!!x.done}">✓</button>
    <div style="min-width:0"><div class="lname">${nm}</div>
      <div class="lmeta">${x.auto?`<span class="chip warn">${t("low_stock_chip")}</span>`:""}${it?`<span>${esc(t("at_home",{q:fq(it.qty),u:unitLabel(it.unit)}))}</span>`:`<span>${t("new_to_stock")}</span>`}</div></div>
    <div class="step"><button data-lq="-1" aria-label="${t("less")}: ${nm}">−</button><span class="q">${fq(x.qty)} <span class="muted" style="font-weight:600;font-size:12px">${esc(unitLabel(x.unit))}</span></span><button data-lq="1" aria-label="${t("more")}: ${nm}">+</button><button data-ldel aria-label="${t("remove")}: ${nm}" style="border-color:transparent;background:transparent;color:var(--muted)">×</button></div>
  </div>`;
}

function viewStock(){
  if(!S.itemsLoaded) return `<div class="empty">${t("loading_stock")}</div>`;
  const low=lowItems(), cats=[...new Set(S.items.map(i=>i.cat||"Other"))].sort(catOrder);
  let list=S.items.filter(i=>!S.q||norm(i.name).includes(norm(S.q)));
  if(S.filter==="low") list=list.filter(i=>level(i)!=="ok");
  else if(S.filter!=="all") list=list.filter(i=>(i.cat||"Other")===S.filter);
  const groups=new Map(); list.sort((a,b)=>a.name.localeCompare(b.name,LOC())).forEach(i=>{const c=i.cat||"Other";if(!groups.has(c))groups.set(c,[]);groups.get(c).push(i)});
  const gk=[...groups.keys()].sort(catOrder);
  const li=LANGS[LANG].idx;
  if(!S.items.length) return `<div class="stack">
    <div class="spread"><h1>${t("tab_stock")}</h1><button class="btn primary" data-edit="">${t("add_item_btn")}</button></div>
    <div class="card stack"><h3>${t("stock_intro_title")}</h3>
      <p class="muted" style="margin:0;font-size:14px">${t("stock_intro_body")}</p>
      <div class="chips">${STAPLES.slice(0,8).map(s=>`<span class="chip">${esc(s[li])}</span>`).join("")}<span class="chip">+${STAPLES.length-8}</span></div>
      <button class="btn primary block" id="addStaples">${t("add_staples",{n:STAPLES.length})}</button>
      <button class="btn block" data-edit="">${t("add_own")}</button></div>${backupCard()}</div>`;
  return `<div class="stack">
    <div class="spread"><div><h1>${t("tab_stock")}</h1><p class="muted" style="margin:2px 0 0;font-size:14px">${t("n_items",{n:S.items.length})} · <span style="color:${low.length?"var(--warn)":"var(--accent)"};font-weight:600">${low.length?t("n_low",{n:low.length}):t("all_stocked")}</span></p></div><button class="btn primary" data-edit="">${t("add_item_btn")}</button></div>
    <input class="field" id="search" type="search" placeholder="${esc(t("search_stock"))}" value="${esc(S.q)}" aria-label="${esc(t("search_stock"))}">
    <div class="chips" role="group" aria-label="${t("filter")}">
      <button class="fchip" data-filter="all" aria-pressed="${S.filter==="all"}">${t("all")}</button>
      <button class="fchip" data-filter="low" aria-pressed="${S.filter==="low"}">${t("low_n",{n:low.length})}</button>
      ${cats.map(c=>`<button class="fchip" data-filter="${esc(c)}" aria-pressed="${S.filter===c}">${esc(catLabel(c))}</button>`).join("")}
    </div>
    ${list.length?gk.map(c=>`<div class="eyebrow cat-head">${esc(catLabel(c))}</div>${groups.get(c).map(itemHtml).join("")}`).join("")
      :`<div class="empty">${S.filter==="low"?t("nothing_low"):t("no_match")}</div>`}
    ${backupCard()}
  </div>`;
}
function itemHtml(it){
  const lv=level(it), s=stepOf(it.unit), q=num(it.qty), u=esc(unitLabel(it.unit)), nm=esc(it.name);
  const max=Math.max(s*10,roundTo(Math.max(num(it.target),num(it.min))*2,s),Math.ceil(q/s)*s+s*2);
  const onList=openLists().some(l=>l.lines.some(x=>x.itemId===it.id&&!x.done));
  const pill=lv==="out"?`<span class="chip bad">${t("pill_out")}</span>`:lv==="low"?`<span class="chip warn">${t("pill_low")}</span>`:`<span class="chip ok">${t("pill_ok")}</span>`;
  return `<section class="card item lvl-${lv}" data-item="${esc(it.id)}">
    <div class="item-top"><div style="min-width:0"><h3 style="overflow-wrap:anywhere">${nm}</h3><div class="row" style="gap:6px;margin-top:3px">${pill}${onList?`<span class="chip">${t("on_list")}</span>`:""}</div></div>
      <div class="qty" data-qtyout>${fq(q)}<small>${u}</small></div></div>
    <div class="slider-row">
      <button class="icon-btn" data-dq="-1" aria-label="${esc(t("use_one",{name:it.name}))}">−</button>
      <div class="slider"><input type="range" id="sl-${esc(it.id)}" min="0" max="${max}" step="${s}" value="${q}" style="--p:${q/max};--m:${Math.min(1,num(it.min)/max)}" aria-label="${esc(t("stock_aria",{name:it.name,u:unitLabel(it.unit)}))}" aria-valuetext="${fq(q)} ${u}"><span class="minmark" style="--m:${Math.min(1,num(it.min)/max)}" title="${esc(t("minimum_q",{q:fq(it.min)}))}"></span></div>
      <button class="icon-btn" data-dq="1" aria-label="${esc(t("add_one",{name:it.name}))}">+</button>
    </div>
    <div class="item-foot"><span class="num">${esc(t("min_target",{min:fq(it.min),target:fq(it.target),u:unitLabel(it.unit)}))}</span>
      <span class="row" style="gap:4px">${!onList?`<button class="btn sm ghost" data-tolist>${t("add_to_list")}</button>`:""}<button class="btn sm" data-edit="${esc(it.id)}">${t("edit")}</button></span></div>
  </section>`;
}

function viewHistory(){
  if(!S.listsLoaded) return `<div class="empty">${t("loading_history")}</div>`;
  const done=doneLists();
  const m0=new Date();m0.setDate(1);m0.setHours(0,0,0,0);
  const month=done.filter(l=>(l.completedAt||0)>=m0.getTime());
  const itemsMonth=month.reduce((s,l)=>s+l.lines.length,0);
  const freq=new Map(); done.forEach(l=>l.lines.forEach(x=>freq.set(x.name,(freq.get(x.name)||0)+1)));
  const top=[...freq].sort((a,b)=>b[1]-a[1])[0];
  return `<div class="stack">
    <div><h1>${t("tab_history")}</h1><p class="muted" style="margin:2px 0 0;font-size:14px">${t("history_sub")}</p></div>
    ${done.length?`<div class="stats">
      <div class="stat"><div class="v">${month.length}</div><div class="k">${esc(t("trips_in",{month:dfmt(new Date(),{month:"long"})}))}</div></div>
      <div class="stat"><div class="v">${itemsMonth}</div><div class="k">${t("items_month")}</div></div>
      <div class="stat"><div class="v" style="font-size:18px;line-height:1.3;overflow-wrap:anywhere">${top?esc(top[0]):"—"}</div><div class="k">${top?t("bought_x",{n:top[1]}):t("most_bought")}</div></div></div>`:""}
    ${done.length?done.map(l=>`<details class="hist" data-hist="${esc(l.id)}" ${S.open===l.id?"open":""}>
      <summary><div class="grow"><div class="eyebrow">${dfmt(l.completedAt,{weekday:"short",day:"numeric",month:"short",year:"numeric"})} · ${tfmt(l.completedAt)}</div>
        <div style="font-weight:600;margin-top:2px;overflow-wrap:anywhere">${esc(l.name)}</div>
        <div class="muted" style="font-size:13px">${t("n_bought",{n:l.lines.length})}${(l.missed||[]).length?" · "+t("n_not_found",{n:l.missed.length}):""}</div></div><span class="chev" aria-hidden="true"></span></summary>
      <div class="body">
        <div class="receipt"><div class="rl"><span>${t("rc_item")}</span><span>${t("rc_qty")}</span></div><hr>
          ${l.lines.map(x=>`<div class="rl"><span>${esc(x.name)}</span><span>${fq(x.qty)} ${esc(unitLabel(x.unit))}</span></div>`).join("")}
          ${(l.missed||[]).map(x=>`<div class="rl miss"><span>${esc(x.name)}</span><span>${fq(x.qty)} ${esc(unitLabel(x.unit))}</span></div>`).join("")}
          <hr><div class="rl"><span>${t("rc_lines",{n:l.lines.length})}</span><span>${dfmt(l.completedAt,{day:"2-digit",month:"2-digit",year:"2-digit"})}</span></div></div>
        <div class="row"><button class="btn sm" data-again="${esc(l.id)}">${t("shop_again")}</button><span class="grow"></span><button class="btn sm ghost danger" data-hdel="${esc(l.id)}">${t("delete")}</button></div>
      </div></details>`).join("")
    :`<div class="empty">${t("no_history")}</div>`}
  </div>`;
}

/* ---------- item sheet ---------- */
function editItem(id){
  const src=itemById(id);
  const it=src?clone(src):{id:uid("i"),name:"",cat:"Other",unit:"pcs",qty:0,min:1,target:3,createdAt:Date.now()};
  const host=$("#sheetHost");
  host.innerHTML=`<div class="sheet-bg" id="sheetBg"><form class="sheet stack" id="itemForm" role="dialog" aria-label="${src?t("edit_item"):t("new_item")}" autocomplete="off">
    <div class="spread"><h2>${src?t("edit_item"):t("new_item")}</h2><button class="btn ghost" type="button" data-close>${t("close")}</button></div>
    <div class="form-grid">
      <label class="full">${t("f_name")}<input class="field" id="fName" value="${esc(it.name)}" placeholder="${esc(t("f_placeholder"))}" required></label>
      <label>${t("category")}<input class="field" id="fCat" list="catList" value="${esc(catLabel(it.cat))}"></label>
      <label>${t("unit")}<select class="field" id="fUnit">${unitOpts(it.unit)}</select></label>
      <label>${t("f_qty")}<input class="field num" id="fQty" inputmode="decimal" value="${fq(it.qty)}"></label>
      <label>${t("f_min")}<input class="field num" id="fMin" inputmode="decimal" value="${fq(it.min)}"></label>
      <label class="full">${t("f_target")}<input class="field num" id="fTarget" inputmode="decimal" value="${fq(it.target)}"></label>
    </div>
    <p class="muted" style="margin:0;font-size:13px">${t("f_help")}</p>
    <button class="btn primary block" type="submit" style="min-height:48px">${src?t("save_changes"):t("add_to_stock")}</button>
    ${src?`<button class="btn ghost danger block" type="button" id="fDel">${t("delete_item")}</button>`:""}
  </form></div>`;
  const close=()=>{host.innerHTML="";host.onclick=null};
  host.onclick=ev=>{const el=ev.target;if(el.id==="sheetBg"||el.closest("[data-close]"))close();if(el.id==="fDel")armed(el,()=>{close();Store.deleteItem(it.id);toast(t("deleted",{name:it.name}))})};
  $("#itemForm").onsubmit=async ev=>{
    ev.preventDefault();
    const name=$("#fName").value.trim(); if(!name){$("#fName").focus();return}
    const dupe=itemByName(name); if(dupe&&dupe.id!==it.id){toast(t("already_in_stock",{name:dupe.name}));return}
    const out={...it,name,cat:catFromLabel($("#fCat").value),unit:$("#fUnit").value,qty:Math.max(0,num($("#fQty").value)),min:Math.max(0,num($("#fMin").value))};
    out.target=Math.max(out.min,num($("#fTarget").value));
    close(); await Store.saveItem(out); await syncAuto(out); if(!src) toast(t("added_name_stock",{name}));
  };
  // new items: suggest a category from the name until the category is changed by hand
  if(!src){ let touched=false;
    $("#fCat").addEventListener("input",()=>{touched=true});
    $("#fName").addEventListener("input",e=>{ if(!touched) $("#fCat").value=catLabel(guessCat(e.target.value)) }); }
  setTimeout(()=>$("#fName")?.focus(),30);
}
function renameList(l){
  const host=$("#sheetHost");
  host.innerHTML=`<div class="sheet-bg" id="sheetBg"><form class="sheet stack" id="renForm" role="dialog" aria-label="${t("rename_list")}">
    <div class="spread"><h2>${t("rename_list")}</h2><button class="btn ghost" type="button" data-close>${t("close")}</button></div>
    <input class="field" id="renName" value="${esc(l.name)}" aria-label="${esc(t("list_name_aria"))}">
    <button class="btn primary block" type="submit">${t("save_name")}</button></form></div>`;
  const close=()=>{host.innerHTML="";host.onclick=null};
  host.onclick=ev=>{if(ev.target.id==="sheetBg"||ev.target.closest("[data-close]"))close()};
  $("#renForm").onsubmit=ev=>{ev.preventDefault();const n=$("#renName").value.trim();close();if(n){const c=clone(l);c.name=n;Store.saveList(c)}};
  setTimeout(()=>$("#renName")?.select(),30);
}

/* ---------- stock backup ---------- */
function backupCard(){
  return `<div class="card stack" style="gap:8px;margin-top:10px">
    <div><h3>${t("backup_title")}</h3><p class="muted" style="margin:2px 0 0;font-size:13px">${S.mode==="cloud"?t("backup_cloud"):t("backup_local")}</p></div>
    <div class="row"><button class="btn" id="exportBtn" ${S.items.length?"":'aria-disabled="true"'}>${t("export")}</button><button class="btn" id="importBtn">${t("import")}</button><input type="file" id="importFile" accept=".json,application/json" hidden></div>
  </div>`;
}
async function exportStock(){
  if(!S.items.length){toast(t("no_stock_export"));return}
  const items=[...S.items].sort((a,b)=>(a.cat||"").localeCompare(b.cat||"")||a.name.localeCompare(b.name))
    .map(({id,name,cat,unit,qty,min,target,createdAt})=>({id,name,cat,unit,qty,min,target,createdAt}));
  const data=JSON.stringify({app:"pantrylog",kind:"stock",version:1,exportedAt:new Date().toISOString(),items},null,1);
  const filename="pantrylog-stock-"+new Date().toISOString().slice(0,10)+".json";
  let dl=null; try{ dl=window.claude?.use ? await window.claude.use("downloads") : null }catch{}
  if(dl){
    try{ await dl.save({filename,data}); toast(t("exported",{n:items.length})); }
    catch(e){ if(e?.code!=="declined") toast(t("save_failed")); }
    return;
  }
  try{ const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([data],{type:"application/json"})); a.download=filename;
    document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000); toast(t("exported",{n:items.length})); }
  catch{ toast(t("dl_blocked")); }
}
// Adds items that aren't here yet (matched by name). Items you already have are left as they are.
async function importStock(file){
  let d; try{ d=JSON.parse(await file.text()) }catch{ toast(t("not_stock_file")); return }
  if(!d||d.app!=="pantrylog"||!Array.isArray(d.items)){ toast(t("not_stock_file")); return }
  const ids=new Set(S.items.map(x=>x.id)), names=new Set(S.items.map(x=>norm(x.name)));
  const fresh=[];
  for(const x of d.items){
    if(!x||!x.name||names.has(norm(x.name))) continue;
    const unit=UNITS.includes(x.unit)?x.unit:"pcs", min=Math.max(0,num(x.min));
    const it={id:(typeof x.id==="string"&&/^[\w.~:@+-]{1,60}$/.test(x.id)&&!ids.has(x.id))?x.id:uid("i"),name:String(x.name).trim().slice(0,80),
      cat:catFromLabel(String(x.cat||"Other").slice(0,40)),unit,qty:Math.max(0,num(x.qty)),min,target:Math.max(min,num(x.target)),createdAt:num(x.createdAt)||Date.now()};
    names.add(norm(it.name)); ids.add(it.id); fresh.push(it);
  }
  const skipped=d.items.length-fresh.length;
  if(!fresh.length){ toast(t("all_already")); return }
  toast(t("importing"));
  for(const it of fresh) await Store.saveItem(it);
  for(const it of fresh) await syncAuto(it,{quiet:true});
  toast(t("imported",{n:fresh.length})+(skipped?" · "+t("skipped",{n:skipped}):""));
}

/* ---------- render ---------- */
function render(){
  if(S.dragging){S.pendingRender=true;return}
  document.querySelectorAll("nav.tabs a").forEach(a=>{if(a.dataset.tab===S.tab)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
  const sync=$("#sync"); sync.className="sync "+(S.mode==="cloud"?"cloud":"");
  sync.querySelector("span").textContent=S.mode==="cloud"?t("sync_cloud"):S.mode==="local"?t("sync_local"):t("loading");
  const l=currentList(), toBuy=l?l.lines.filter(x=>!x.done).length:0, low=lowItems().length;
  const bl=$("#badgeList"); bl.hidden=!toBuy; bl.textContent=toBuy;
  const bs=$("#badgeStock"); bs.hidden=!low; bs.textContent=low;
  $("#itemNames").innerHTML=S.items.map(i=>`<option value="${esc(i.name)}">`).join("");
  $("#catList").innerHTML=CATS.map(c=>`<option value="${esc(catLabel(c))}">`).join("");
  // keep focus and caret across live re-renders
  const ae=document.activeElement, fid=ae&&ae.id&&$("#main").contains(ae)?ae.id:null, sel=fid&&ae.selectionStart!=null?[ae.selectionStart,ae.selectionEnd]:null;
  $("#main").innerHTML=S.tab==="stock"?viewStock():S.tab==="history"?viewHistory():viewList();
  if(fid){const el=document.getElementById(fid);if(el){el.focus({preventScroll:true});if(sel)try{el.setSelectionRange(...sel)}catch{}}}
}

// Switch tab without relying on the browser's hash navigation (some app views ignore it). Tapping the open tab scrolls to the top.
function go(tab){
  if(!TABS.includes(tab)) return;
  const same=S.tab===tab; S.tab=tab;
  try{ if(location.hash!=="#"+tab) history.replaceState(null,"","#"+tab) }catch{}
  if(!same){ S.dragging=false; render(); }
  try{ window.scrollTo({top:0,behavior:same?"smooth":"auto"}) }catch{ window.scrollTo(0,0) }
}

/* ---------- events ---------- */
const main=$("#main");
main.addEventListener("click",async ev=>{
  const b=ev.target.closest("button,[data-filter]"); if(!b) return;
  const l=currentList();
  if(b.id==="exportBtn"){exportStock();return}
  if(b.id==="importBtn"){$("#importFile").click();return}
  if(b.dataset.edit!==undefined){editItem(b.dataset.edit);return}
  if(b.id==="newList"){const n=makeList();if(openLists().some(o=>o.name===n.name))n.name+=" ("+(openLists().length+1)+")";S.listId=n.id;await Store.saveList(n);go("list");return}
  if(b.id==="renameList"&&l){renameList(l);return}
  if(b.id==="delList"&&l){armed(b,()=>{S.listId=null;Store.deleteList(l.id);toast(t("list_deleted"))});return}
  if(b.id==="completeBtn"&&l){b.disabled=true;await completeList(l);return}
  if(b.dataset.pick){S.listId=b.dataset.pick;render();return}
  if(b.id==="addLow"){
    let target=l?clone(l):makeList(), n=0;
    for(const it of lowItems()){ if(target.lines.some(x=>x.itemId===it.id)) continue;
      target.lines.push({id:uid("ln"),itemId:it.id,name:it.name,unit:it.unit,qty:needFor(it),done:false,auto:true,cat:it.cat||"Other"}); n++; }
    S.listId=target.id; await Store.saveList(target); toast(t("added_low",{n})); return;
  }
  if(b.id==="addStaples"){
    const li=LANGS[LANG].idx;
    for(const s of STAPLES){ const name=s[li]; if(itemByName(name)) continue; const [,,,cat,unit,qty,min,target]=s; await Store.saveItem({id:uid("i"),name,cat,unit,qty,min,target,createdAt:Date.now()}); }
    toast(t("staples_added",{n:STAPLES.length})); return;
  }
  const lineEl=b.closest("[data-line]");
  if(lineEl&&l){
    const c=clone(l), ln=c.lines.find(x=>x.id===lineEl.dataset.line); if(!ln) return;
    if(b.dataset.tick!==undefined) ln.done=!ln.done;
    else if(b.dataset.lq){const s=stepOf(ln.unit);ln.qty=Math.max(s,roundTo(num(ln.qty)+s*+b.dataset.lq,s));ln.auto=false}
    else if(b.dataset.ldel!==undefined) c.lines=c.lines.filter(x=>x.id!==ln.id);
    await Store.saveList(c); return;
  }
  if(b.dataset.filter){S.filter=b.dataset.filter;render();return}
  const itemEl=b.closest("[data-item]");
  if(itemEl){
    const it=itemById(itemEl.dataset.item); if(!it) return;
    if(b.dataset.dq){setQty(it.id,num(it.qty)+stepOf(it.unit)*+b.dataset.dq);return}
    if(b.dataset.tolist!==undefined){const c=addLine(it.name,needFor(it),it.unit);if(c){await Store.saveList(c);toast(t("added_to_list",{name:it.name,list:shortName(c)}))}return}
  }
  if(b.dataset.again){
    const h=S.lists.find(x=>x.id===b.dataset.again); if(!h) return;
    let c=l?clone(l):makeList();
    for(const x of [...h.lines,...(h.missed||[])]){ const ex=c.lines.find(y=>!y.done&&norm(y.name)===norm(x.name)); if(ex) continue;
      const it=itemByName(x.name); c.lines.push({id:uid("ln"),itemId:it?.id||null,name:x.name,unit:x.unit,qty:x.qty,done:false,auto:false,cat:it?.cat||guessCat(x.name)}); }
    S.listId=c.id; await Store.saveList(c); toast(t("copied")); go("list"); return;
  }
  if(b.dataset.hdel){armed(b,()=>{Store.deleteList(b.dataset.hdel);toast(t("removed_history"))});return}
});
main.addEventListener("toggle",ev=>{const d=ev.target;if(d.matches?.("details.hist")){if(d.open)S.open=d.dataset.hist;else if(S.open===d.dataset.hist)S.open=null}},true);
main.addEventListener("submit",async ev=>{
  if(ev.target.id!=="addForm") return; ev.preventDefault();
  const name=$("#addName").value.trim(); if(!name){$("#addName").focus();return}
  const c=addLine(name,$("#addQty").value,$("#addUnit").value,{cat:$("#addCat").value}); if(!c) return;
  S.draft={name:"",qty:"1",unit:"pcs",cat:"Other",catTouched:false}; S.listId=c.id; await Store.saveList(c); $("#addName")?.focus();
});
main.addEventListener("input",ev=>{
  const el=ev.target;
  if(el.id==="addName"){
    S.draft.name=el.value; const it=itemByName(el.value);
    if(it){S.draft.unit=it.unit;const u=$("#addUnit");if(u)u.value=it.unit}
    if(it||!S.draft.catTouched){S.draft.cat=it?(it.cat||"Other"):guessCat(el.value);const c=$("#addCat");if(c&&CATS.includes(S.draft.cat))c.value=S.draft.cat}
  }
  if(el.id==="addQty") S.draft.qty=el.value;
  if(el.id==="search"){S.q=el.value;render()}
  if(el.type==="range"){
    S.dragging=true; const card=el.closest("[data-item]"), it=itemById(card.dataset.item); const v=num(el.value), max=num(el.max);
    el.style.setProperty("--p",v/max); card.querySelector("[data-qtyout]").innerHTML=`${fq(v)}<small>${esc(unitLabel(it.unit))}</small>`;
    const lv=v<=0?"out":v<num(it.min)?"low":"ok"; card.classList.remove("lvl-ok","lvl-low","lvl-out"); card.classList.add("lvl-"+lv);
    el.setAttribute("aria-valuetext",`${fq(v)} ${unitLabel(it.unit)}`);
  }
});
main.addEventListener("change",ev=>{
  const el=ev.target;
  if(el.id==="importFile"){const f=el.files[0]; el.value=""; if(f) importStock(f); return}
  if(el.id==="addUnit") S.draft.unit=el.value;
  if(el.id==="addCat"){S.draft.cat=el.value;S.draft.catTouched=true}
  if(el.type==="range"){S.dragging=false;S.pendingRender=false;setQty(el.closest("[data-item]").dataset.item,el.value,{immediate:true})}
});
["pointerup","touchend","keyup"].forEach(e=>main.addEventListener(e,()=>{if(S.dragging){setTimeout(()=>{if(S.dragging){S.dragging=false;if(S.pendingRender)render()}},300)}}));
window.addEventListener("hashchange",()=>{const n=fromHash();if(n!==S.tab){S.tab=n;render();window.scrollTo(0,0)}});
document.addEventListener("click",ev=>{const a=ev.target.closest('a[href^="#"]');if(!a)return;const tab=a.getAttribute("href").slice(1);if(TABS.includes(tab)){ev.preventDefault();go(tab)}});
$("#lang").addEventListener("change",e=>setLang(e.target.value));

setLang(LANG); Store.init();
})();
