// TODO: Переписать что бы работало не только EN RU
// TODO: Если несколько раз файл CSV прикрепляем корректно отрабатывать
// TODO: Проверка на большом файле
// TODO: Частотный словарь
// TODO: новая таблица DONE
// TODO: нумерацию добавить DONE
// TODO: слова en ru с маленькой буквы DONE
// TODO: Не повторять ru перевод если дублируется
// TODO: Возможность редактировать страницу перед скачиванием файла


// ru = это первый случай».
// ru = мудрец | мудрец

// DONE
// Слова с большой буквы => DONE
// Переписать что бы была выгрузка в TXT => DONE

let mapWords = new Map(); // Что бы если мы несколько вариантов добавляли то перечислялись



function downloadAsFile() {

    // Cформировать txt файл
    let textArray = [];
    for (let rowObject of mapWords.values()) {
        textArray.push([rowObject.Front, rowObject.Back, rowObject.ExampleF, rowObject.ExampleB].join("\t"));
    }
    let text = textArray.join("\n");

    // Скачать его
    let a = document.createElement("a");
    let file = new Blob([text], { type: 'application/text' });
    a.href = URL.createObjectURL(file);
    a.download = "toAnki.txt";
    a.click();
}

function showFile(input) {
    let file = input.files[0];

    console.log(`File name: ${file.name}`); // например, my.png

    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => onloadCSV(reader.result);
}

function onloadCSV(text) {
    console.log('Файл загружен');

    let tableElement = document.getElementsByClassName("table")[0].getElementsByTagName('tbody')[0];
    let RowArray = text.split('\n');

    // Заполняем Map
    for (let j = 0; j < RowArray.length; j++) {

        if (j == 0) continue; // Заголовок не нужен

        let rowObject = new NewRowObject(RowArray[j]);
        if (rowObject.isTrashe) {
            continue; // Не нужые данные
        }
        else if (mapWords.has(rowObject.Front)) {
            // Добавляем альтернативный Back, ExampleF, ExampleB

            let oldData = mapWords.get(rowObject.Front);
            oldData.Back += " | " + rowObject.Back;
            oldData.ExampleF += "<br>" + rowObject.ExampleF;
            oldData.ExampleB += "<br>" + rowObject.ExampleB;

            mapWords.set(rowObject.Front, oldData);
        }
        else {
            // Отсутствует, просто добавляем
            mapWords.set(rowObject.Front, rowObject);
        }
    }




    // Выводим как HTML таблицу
    let numerator = 1;
    for (let rowObject of mapWords.values()) {

        let rowHTML = tableElement.insertRow();
        for (let i = 0; i < 7; i++) {
            rowHTML.insertCell();
        }

        rowHTML.cells[0].innerHTML = numerator;
        rowHTML.cells[1].innerHTML = rowObject.en;
        rowHTML.cells[2].innerHTML = rowObject.ru;
        rowHTML.cells[3].innerHTML = rowObject.Front;
        rowHTML.cells[4].innerHTML = rowObject.Back;
        rowHTML.cells[5].innerHTML = rowObject.ExampleF;
        rowHTML.cells[6].innerHTML = rowObject.ExampleB;

        numerator++;
    }

}

function NewRowObject(str) {
    // Замена строчного шрифта на жирный, я привык к такому
    str = str.replaceAll("<em", "<b");   // Замена для двух случаев <em class=""both""> и <em>
    str = str.replaceAll("</em>", "</b>");

    // Используем код запятой 44 что бы отделять запятую как часть CSV от запятой как часть текста
    let keyArray = str.replaceAll(", ", "&#44 ").split(",");

    this.en = "";
    this.ru = "";
    this.Front = "";
    this.Back = "";
    this.ExampleF = "";
    this.ExampleB = "";
    this.isTrashe = false;
    //this.other = keyArray[8]; URL есть, но пока не нужен

    if (keyArray.length < 4) {
        // Иногда URL попадает на новую страницу, ставим isTrashe и пропускаем.
        // Если будет использовать URL то надо пепеписать этот фрагмент
        this.isTrashe = true;
        return;
    }

    if (keyArray[0] == "en") {
        this.en = keyArray[0];
        this.ru = keyArray[1];
        this.Front = keyArray[2];
        this.Back = keyArray[3];
        this.ExampleF = keyArray[5];
        this.ExampleB = keyArray[6];
    }
    else {
        this.ru = keyArray[0];
        this.en = keyArray[1];
        this.Back = keyArray[2];
        this.Front = keyArray[3];
        this.ExampleB = keyArray[5];
        this.ExampleF = keyArray[6];
    }

    if(this.Back == "" || this.Back == "..."){
        this.Back = getAnotherBack(this.ExampleB);
    }

    // Первый символ с большой буквы - отключил
    // this.Front = ucFirst(this.Front);
    // this.Back = ucFirst(this.Back);

    // Уберем лишние ковычки с двух сторон
    this.Front = clearQuotationMarksFirstLast(this.Front);
    this.Back = clearQuotationMarksFirstLast(this.Back);
    this.ExampleF = clearQuotationMarksFirstLast(this.ExampleF);
    this.ExampleB = clearQuotationMarksFirstLast(this.ExampleB);

    this.ExampleF = this.ExampleF.replaceAll("&#44 ", ", ");
    this.ExampleB = this.ExampleB.replaceAll("&#44 ", ", ");

    function clearQuotationMarksFirstLast(str) {
        if (str[0] == '"' && str[str.length - 1] == '"') {
            str = str.substring(1, str.length - 1);
        }
        return str;
    }

    function ucFirst(str) {
        if (!str) return str;

        return str[0].toUpperCase() + str.slice(1);
    }

    function getAnotherBack(ExampleB){
        // Нет ответа от Reverso - извлечем из примера
        let answer = [];
        let testElement = document.createElement('p');
        testElement.innerHTML = ExampleB;

        let testElementB = testElement.querySelectorAll('b');
        for (let elem of testElementB) {
            answer.push(elem.textContent);
          }

        answer = answer.join(" ");
        answer = answer.replaceAll("&#44 ", ", ");

        return answer;
    }

}
