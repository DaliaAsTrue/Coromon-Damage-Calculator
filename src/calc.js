function getDamage(atkMon, defMon, selectedSkill, weather = "none") {
    
    //Calculation Variables
    let A = 1;
    let D = 1;
    let defHP = 1;
    let stab = 1;
    let effectiveness = 1;
    let trait1 = 1;
    let trait2 = 1;
    let crit = 1;
    let feelers = 1;
    let boost1 = 0;
    let boost2 = 0;
    let weatherBonus = 1;

    //Check Inputs
    if (selectedSkill.crit) {
      crit = 1.5;
    } else {
      crit = 1;
    }
    
    if (false) {        //Fix
      feelers = 2.5;
    } else {
      feelers = 1;
    }

    if (selectedSkill.atkType == "Physical") {
        A = Math.floor(atkMon.stats[2] * atkMon.sets[0].level / 99) + 5 + atkMon.sets[0].potential[2];
        D = Math.floor(defMon.stats[3] * defMon.sets[0].level / 99) + 5 + defMon.sets[0].potential[3];
        boost1 = atkMon.statBoost[0];
        boost2 = defMon.statBoost[1];
    } else if (selectedSkill.atkType == "Special") {
        A = Math.floor(atkMon.stats[4] * atkMon.sets[0].level / 99) + 5 + atkMon.sets[0].potential[4];
        D = Math.floor(defMon.stats[5] * defMon.sets[0].level / 99) + 5 + defMon.sets[0].potential[5];
        boost1 = atkMon.statBoost[2];
        boost2 = defMon.statBoost[3];
    } else {
        return [0, 0, 0, 0]
    }

    defHP = Math.floor(defMon.stats[0] * defMon.sets[0].level / 99) + 10 + parseInt(defMon.sets[0].level) + parseInt(defMon.sets[0].potential[0]);

    if (atkMon.type == selectedSkill.type) {
      stab = 1.25;
    } else {
      stab = 1;
    }
    
    effectiveness = getEffectiveness(selectedSkill.type, defMon.type);
    
    if (atkMon.sets[0].trait == "Clumsy Power") {
      trait1 = 1.25;
    } else if (atkMon.sets[0].trait == "Amplified" && effectiveness == 2) {
      trait1 = 1.25;
    } else {
      trait1 = 1;
    }

    if (defMon.sets[0].trait == "Fully Rested") {
      trait2 = 0.6;
    }

    if (boost1 > 0) {
      boost1 = 1 + boost1 * 0.5;
    } else if (boost1 < 0) {
      switch(boost1) {
        case -1:
          boost1 = 0.66;
          break;
        case -2:
          boost1 = 0.5;
          break;
        case -3:
          boost1 = 0.4;
          break;
        case -4:
          boost1 = 0.33;
          break;
        case -5:
          boost1 = 0.28;
          break;
        case -6:
          boost1 = 0.25;
          break;
      }
    } else {
      boost1 = 1;
    }

    if (boost2 > 0) {
      boost2 = 1 + boost2 * 0.5;
    } else if (boost2 < 0) {
      switch(boost2) {
        case -1:
          boost2 = 0.66;
          break;
        case -2:
          boost2 = 0.5;
          break;
        case -3:
          boost2 = 0.4;
          break;
        case -4:
          boost2 = 0.33;
          break;
        case -5:
          boost2 = 0.28;
          break;
        case -6:
          boost2 = 0.25;
          break;
      }
    } else {
      boost2 = 1;
    }

    //Check Weather
    if (weather == "Rain" && selectedSkill.type == "Water") {
        weatherBonus = 1.5;
    }
    if (weather == "Sandstorm" && selectedSkill.type == "Sand") {
        weatherBonus = 1.5;
    }
    if (weather == "Snow" && selectedSkill.type == "Ice") {
        weatherBonus = 1.5;
    }

    //Damage Calculation
    if (selectedSkill.name == "Splash") {
        var multipliers = stab * effectiveness * crit * weatherBonus;
        var lowDamage = Math.floor(defMon.sets[0].level * multipliers);
        var highDamage = lowDamage;
    } else {
        var multipliers = stab * trait1 * trait2 * weatherBonus * crit * feelers * effectiveness * boost1 / boost2;
        var lowDamage = Math.floor( ((((((2*atkMon.sets[0].level)/5) + 2) * selectedSkill.power * A / D) / 50) + 2) * multipliers * 0.85 );
        var highDamage = Math.floor( ((((((2*atkMon.sets[0].level)/5) + 2) * selectedSkill.power * A / D) / 50) + 2) * multipliers );
    }
    var lowPerc = Math.round((lowDamage / defHP) * 100);
    var highPerc = Math.round((highDamage / defHP) * 100);

    return [lowDamage, highDamage, lowPerc, highPerc];

}

function getStatement(atkMon, defMon, selectedSkill) {
    let statement = "";
    if (selectedSkill.atkType == "Physical") {
        statement += atkMon.sets[0].potential[2] + " Atk ";
    } else if (selectedSkill.atkType == "Special") {
        statement += atkMon.sets[0].potential[4] + " SpA ";
    }

    statement += atkMon.name + " " + selectedSkill.name + " vs. ";

    if (selectedSkill.atkType == "Physical") {
        statement += defMon.sets[0].potential[3] + " Def ";
    } else if (selectedSkill.atkType == "Special") {
        statement += defMon.sets[0].potential[5] + " SpD ";
    }

    statement += defMon.name + ": " + getDamage(atkMon, defMon, selectedSkill)[0] + "-"
        + getDamage(atkMon, defMon, selectedSkill)[1] + " ";
    statement += "(" + getDamage(atkMon, defMon, selectedSkill)[2] + "% - "
        + getDamage(atkMon, defMon, selectedSkill)[3] + "%)";

    return statement;
}

function getEffectiveness(type1, type2) {
  
    switch(type1 + "->" + type2) {
      
      //Resistances
      case "Normal->Ghost":
      case "Electric->Electric":
      case "Electric->Sand":
      case "Ghost->Normal":
      case "Sand->Water":
      case "Sand->Sand":
      case "Fire->Water":
      case "Fire->Fire":
      case "Ice->Fire":
      case "Ice->Ice":
      case "Water->Water":
      case "Water->Electric":
      case "Water->Ice":
      case "Foul->Sand":
      case "Heavy->Fire":
      case "Air->Ice":
      case "Poison->Ice":
      case "Cut->Ghost":
        return 0.5;
        break;
      
      //Weaknesses
      case "Electric->Water":
      case "Ghost->Ghost":
      case "Sand->Electric":
      case "Fire->Ice":
      case "Ice->Water":
      case "Water->Sand":
      case "Water->Fire":
      case "Magic->Ghost":
      case "Foul->Water":
      case "Heavy->Ice":
      case "Air->Fire":
      case "Poison->Normal":
      case "Cut->Electric":
        return 2;
        break;
      
      //Neutral
      default:
        return 1;
        break;
    }
    
  }