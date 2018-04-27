/*global $, console, alert*/
/*jslint eqeq: true, plusplus: true, vars: true*/
$(document).ready(function () {
    'use strict';
    var inputDataHtml = $('.inputData input'),
        nVariables,
        nConstraints,
        nVariablesOfDecision,
        matriceA,
        vectorB,
        vectorC,
        i,
        j,
        k,
        solsol = '<div class="row table-responsive detail"><div class="col-md-offset-1 col-md-7  table-responsive result_matriceA"></div><div class="col-md-4  table-responsive result_vectorB"></div><div class="col-md-offset-1 col-md-11 table-responsive result_vectorC"></div></div>';
    /* my function start */
    function filterInputs(inputSlector, maxLength) {
        var charAllowed = [116];
        inputSlector.on('input keydown', function (e) {
            if ($(this).val().length > maxLength) {
                $(this).val($(this).val().substr(0, maxLength));
                alert("max Length: " + maxLength);
            } else {
                if (e.keyCode <= 57 || charAllowed.indexOf(e.keyCode) > -1) {
                    return;
                } else {
                    e.preventDefault();
                }
            }
        });
    }
    function arrayToTable(container, array, spanTd, caption, vertical) {
        caption = typeof caption !== "undefined" ? '<caption>' + caption + '</caption>' : "";
        vertical = typeof vertical === "boolean" ? vertical : false;
        var table = '<table class="table table-bordered"></table>',
            tr = '<tr></tr>',
            span,
            input = '<input value="0">',
            select = '<select><option value="0">&lt;</option><option value="1">&gt;</option></select>',
            td = '<td>' + input + '</td>';
        container.html(table);
        container.children('table').append(caption);
        if (Array.isArray(array[0])) {
            for (i = 0; i < array.length; i += 1) {
                container.children('table').append(tr);
                for (j = 0; j < (array[i].length); j += 1) {
                    span = '<span>' + spanTd + (j + 1) + '</span>';
                    container.children('table').children('tr').eq(i).append(td);
                    container.children('table').children('tr').eq(i).children('td').eq(j).append(span);
                }
            }

        } else {
            if (vertical) {
                tr = '<tr>' + td + '</tr>';
                for (i = 0; i < array.length; i += 1) {
                    span = '<span>' + spanTd + (i + 1) + '</span>';
                    container.children('table').append(tr);
                    container.children('table').children('tr').eq(i).children('td').prepend(select);
                    container.children('table').children('tr').eq(i).children('td').append(span);
                }
            } else {
                container.children('table').append(tr);
                for (i = 0; i < (array.length); i += 1) {
                    span = '<span>' + spanTd + (i + 1) + '</span>';
                    container.children('table').children('tr').append(td);
                    container.children('table').children('tr').children('td').eq(i).append(span);
                }
            }
        }
    }
    function tableToArray(table, child) {
        var newArray = [],
            value,
            trLength = table.find('tr').length,
            tdLength = table.find('tr').first().find('td').length;
        if (trLength > 1 && tdLength > 1) {
            newArray = new Array(table.find('tr').length);
            for (i = 0; i < trLength; i += 1) {
                newArray[i] = new Array(tdLength);
                for (j = 0; j < tdLength; j += 1) {
                    value = !isNaN(parseFloat(table.children('tr').eq(i).children('td').eq(j).find(child).val(), 10)) ? parseFloat(table.children('tr').eq(i).children('td').eq(j).find(child).val(), 10) : 0;
                    newArray[i][j] = value;
                }
            }
        } else if (trLength > 1 && tdLength <= 1) {
            for (i = 0; i < trLength; i += 1) {
                value = !isNaN(parseFloat(table.children('tr').eq(i).children('td').find(child).val(), 10)) ? parseFloat(table.children('tr').eq(i).children('td').find(child).val(), 10) : 0;
                newArray[i] = value;
            }
        } else {
            for (i = 0; i < tdLength; i += 1) {
                value = !isNaN(parseFloat(table.children('tr').children('td').eq(i).find(child).val(), 10)) ? parseFloat(table.children('tr').children('td').eq(i).find(child).val(), 10) : 0;
                newArray[i] = value;
            }
        }
        return newArray;
    }
    function standardiser(array, ecart, arraySigne) {
        var ArrayLength,
            one;
        if (Array.isArray(array[0])) {
            ArrayLength = array[0].length;
            for (i = 0; i < array.length; i += 1) {
                one = arraySigne[i] === 0 ? 1 : -1;
                for (j = ArrayLength; j < (ArrayLength + ecart); j += 1) {
                    array[i][j] = 0;
                    array[i][i + ArrayLength] = one;
                    
                }
                
            }
        } else {
            ArrayLength = array.length;
            for (i = ArrayLength; i < (ArrayLength + ecart); i += 1) {
                array[i] = 0;
            }
        }
        return array;
    }
    
    /*Algorithm function start*/
    function ifCHasPositiveNode(vector) {
        for (i = 0; i < vector.length; i++) {
            if (vector[i] > 0) {
                return true;
            }
        }
        return false;
    }

    function indexOfWorst(vector) {
        var IndexOfWorst = 0,
            worst = Number.MAX_SAFE_INTEGER;
        for (i = 0; i < vector.length; i++) {
            if (vector[i] < worst) {
                if (vector[i] > 0) {
                    IndexOfWorst = i;
                    worst = vector[i];
                }
            }
        }
        return IndexOfWorst;
    }

    function indexOfBest(vector) {
        var IndexOfBest = 0,
            best = 0;
        for (i = 0; i < vector.length; i++) {
            if (vector[i] > best) {
                IndexOfBest = i;
                best = vector[i];
            }
        }
        return IndexOfBest;
    }
    /*Algorithm function end*/
    /* my function end */
    /*Creating table of inputs Start*/
    filterInputs(inputDataHtml, 1);
    inputDataHtml.first().on("input", function () {
        $('.problemDataInput').hide();
        $('.problemDataInput').find("table").remove();
        inputDataHtml.last().val("");
    });
    inputDataHtml.last().on("input", function () {
        nVariables = parseInt($(this).val(), 10);
        nConstraints = !isNaN(parseInt(inputDataHtml.first().val(), 10)) ? parseInt(inputDataHtml.first().val(), 10) : 0;
        nVariablesOfDecision = nVariables + nConstraints;
        vectorB = new Array(nConstraints);
        vectorC = new Array(nVariables);
        matriceA = new Array(nConstraints);
        for (i = 0; i < nConstraints; i += 1) {
            matriceA[i] = new Array(nVariables);
            vectorB[i] = 0;
            for (j = 0; j < nVariables; j += 1) {
                matriceA[i][j] = 0;
                vectorC[j] = 0;
            }
        }
        arrayToTable($('.vectorB'), vectorB, "Y", "Vector B", true);
        arrayToTable($('.vectorC'), vectorC, "X", "Vector C");
        arrayToTable($('.matriceA'), matriceA, "X", "Matrice A");
        $('.problemDataInput').slideDown(1200);
        $("html, body").animate({ scrollTop: $('.problemDataInput').offset().top }, 1000);
        filterInputs($('.equation input'), 5);
    });
    
    $('.btnGoContainer button').click(function () {
        var signe = (tableToArray($('.vectorB table'), "select")),
            borneError = false,
            displaySol,
            displayTable,
            solX1,
            solX2,
            solZ,
            displayMatriceAStand,
            displayVectorBStand,
            displayVectorCStand,
            displayMatriceA = [],
            displayVectorB = [],
            displayVectorC = [],
            indexes = [0, 1, 2, 3, 4, 5];
        
        $(".solutionConainer").slideDown(1200);
        $(".problemConainer").slideUp(1200);
        matriceA = displayMatriceAStand =  standardiser(tableToArray($('.matriceA table'), 'input'), nConstraints, signe);
        vectorB = displayVectorBStand = tableToArray($('.vectorB table'), "input");
        vectorC = displayVectorCStand = standardiser(tableToArray($('.vectorC table'), "input"), nConstraints);
        
        /*append Standardisation in html start*/
        arrayToTable($('.stand_matriceA'), displayMatriceAStand, 'X', 'Matrice A');
        arrayToTable($('.stand_vectorB'), displayVectorBStand, 'Y', 'Vector B', true);
        arrayToTable($('.stand_vectorC'), displayVectorCStand, 'X', 'Vector C');
        
        /*append Standardisation in html end*/
        
            
        while (ifCHasPositiveNode(vectorC)) {
            var currentColumn = new Array(nConstraints),
                indexOfTheBestC = indexOfBest(vectorC);
            for (i = 0; i < nConstraints; i++) {
                if (matriceA[i][indexOfTheBestC] === 0) {
                    currentColumn[i] = -1;
                } else {
                    currentColumn[i] = vectorB[i] / matriceA[i][indexOfTheBestC];
                }
            }
            if (ifCHasPositiveNode(currentColumn)) {
                var indexOfTheWorst = indexOfWorst(currentColumn),
                    currentVectorB = new Array(nConstraints),
                    currentVectorC = new Array(nVariables),
                    currentVectorA = [];
                for (i = 0; i < nConstraints; i++) {
                    currentVectorA[i] = [];
                    for (j = 0; j < nVariables; j++) {
                        currentVectorA[i][j] = "";
                    }
                }

                indexes[indexOfTheBestC] = indexOfTheWorst;

                currentVectorB[indexOfTheWorst] =
                        vectorB[indexOfTheWorst] / matriceA[indexOfTheWorst][indexOfTheBestC];

                currentVectorC[indexOfTheBestC] = 0;

                for (i = 0; i < vectorC.length; i++) {
                    if (i !== indexOfTheBestC) {
                        currentVectorC[i] = vectorC[i] -
                                vectorC[indexOfTheBestC] * matriceA[indexOfTheWorst][i] / matriceA[indexOfTheWorst][indexOfTheBestC];
                    }
                }

                for (i = 0; i < matriceA[0].length; i++) {
                    currentVectorA[indexOfTheWorst][i] =
                            matriceA[indexOfTheWorst][i] / matriceA[indexOfTheWorst][indexOfTheBestC];
                }

                for (i = 0; i < matriceA.length; i++) {
                    if (i !== indexOfTheWorst) {
                        currentVectorA[i][indexOfTheBestC] = 0;
                    }
                }

                for (i = 0; i < matriceA.length; i++) {
                    for (j = 0; j < matriceA[0].length; j++) {
                        if (i !== indexOfTheWorst && j !== indexOfTheBestC) {
                            currentVectorA[i][j] =
                                    matriceA[i][j] -
                                            matriceA[i][indexOfTheBestC] * matriceA[indexOfTheWorst][j] / matriceA[indexOfTheWorst][indexOfTheBestC];
                        }
                    }
                }

                for (i = 0; i < vectorB.length; i++) {
                    if (i !== indexOfTheWorst) {
                        currentVectorB[i] = vectorB[i] -
                                vectorB[indexOfTheWorst] * matriceA[i][indexOfTheBestC] / matriceA[indexOfTheWorst][indexOfTheBestC];
                    }
                }
                matriceA = currentVectorA;
                vectorB = currentVectorB;
                vectorC = currentVectorC;
                displayMatriceA[displayMatriceA.length] = matriceA;
                displayVectorB[displayVectorB.length] = vectorB;
                displayVectorC[displayVectorC.length] = vectorC;


            } else {
                borneError = true;
                break;
            }
        }
        if (borneError) {
            alert("A borne Error was occurred");
        } else {
            console.log(vectorC);
            if (indexes[0] == -1) {
                solX1 = 0;
                $('.variables_sol p.x1_sol span').html(solX1);
            } else {
                solX1 = vectorB[indexes[0]];
                $('.variables_sol p.x1_sol span').html(solX1);
                console.log("X is " + vectorB[indexes[0]]);

            }
            if (indexes[1] == -1) {
                solX2 = 0;
                $('.variables_sol p.x2_sol span').html(solX2);
                console.log("Y is 0");
            } else {
                solX2 = vectorB[indexes[1]];
                $('.variables_sol p.x2_sol span').html(solX2);
                console.log("Y is " + vectorB[indexes[1]]);
            }
            if (indexes[2] == -1) {
                console.log("Z is 0");
                solZ = 0;
            } else {
                solZ = vectorB[indexes[2]];
                console.log("Z is " + vectorB[indexes[2]]);
            }
        }
        for (k = 0; k < displayVectorC.length; k += 1) {
            $('.itertion_detail').append(solsol);
            arrayToTable($('.itertion_detail').children(".detail").eq(k).children(".result_matriceA"), displayMatriceA[k], "X", "Matrice A");
            
            
            
            arrayToTable($('.itertion_detail').children(".detail").eq(k).children(".result_vectorB"), displayVectorB[k], "Y", "Vector B", true);
            
            
            arrayToTable($('.itertion_detail').children(".detail").eq(k).children(".result_vectorC"), displayVectorC[k], "X", "Vector C");
            
            $('.itertion_detail').children("div").eq(k).prepend("<h3>Iteration: " + (k + 1) + "</h3>");
            
            for (i = 0; i < displayVectorB[k].length; i += 1) {
                $('.itertion_detail').children(".detail").eq(k).children(".result_vectorB").find("tr").eq(i).children('td').prepend(Math.round(displayVectorB[k][i] * 100) / 100);
                
                
                
               /* For Standardisation matrice A start */
                if (k === 0) {
                    $('.stand_vectorB').children("table").children("tr").eq(i).children('td').prepend(Math.round(displayVectorBStand[i] * 100) / 100);
                    
                   
                }
                /* For Standardisation matrice A End */
                
                
                for (j = 0; j < displayVectorC[k].length; j += 1) {
                    if (k === 0) {
                        $('.stand_matriceA').children("table").find("tr").eq(i).children('td').eq(j).prepend(Math.round(displayMatriceAStand[i][j] * 100) / 100);
                        
                    }
                    
                    
                    $('.itertion_detail').children(".detail").eq(k).children(".result_matriceA").find("tr").eq(i).children('td').eq(j).prepend(Math.round(displayMatriceA[k][i][j] * 100) / 100);
                    
                }
            }
            for (i = 0; i < displayVectorC[k].length; i += 1) {
                $('.itertion_detail').children(".detail").eq(k).children(".result_vectorC").find("tr").children('td').eq(i).prepend(Math.round(displayVectorC[k][i] * 100) / 100);
                
                
                if (k === 0) {
                    $('.stand_vectorC').children("table").children("tr").children('td').eq(i).prepend(Math.round(displayVectorCStand[i] * 100) / 100);
                    
                }
            }
            
        }
        
        $("#detail").click(function () {
            $(this).children("span").toggleClass("glyphicon-minus");
            $('.hello').slideToggle(1000);
            $("html, body").animate({ scrollTop: $(this).offset().top }, 1000);
        });
        $('#new_prblm').click(function () {
            location.reload();
        });
        
    });
    /*Creating table of inputs End*/
});