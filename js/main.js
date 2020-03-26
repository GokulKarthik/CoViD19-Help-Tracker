var currentPage = 1;

var table = new Tabulator("#reports_table", {
    layout: "fitColumns",
    placeholder: "Data Loading",
    autoResize: true,
    columns: [
        { title: "Name", field: "name", headerFilter: "input" },
        { title: "Email", field: "email", headerFilter: "input" },
        { title: "Phone", field: "phone", headerFilter: "number" },
        {
            title: "Report Category", field: "report_category", headerFilter: "input", formatter: function (cell) {
                return JSON.stringify(cell.getValue());
            },
            formatterParams: {
                height: "50px",
                width: "50px",
            }
        },
        { title: "Report Message", field: "report_message", formatter: "textarea", headerFilter: "input" },
    ],
    pagination: "local",
    paginationSize: 15,
});

function get_data() {
    var data = {};
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "https://db-server-dot-corona-bot-gbakse.appspot.com/get_all_reports", true);
    xmlhttp.onreadystatechange = function () {
        var currentPage = table.getPage()
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            data = JSON.parse(xmlhttp.responseText);
            table.setData(data); //change data
            table.setPage(Math.min(currentPage, table.getPageMax()));
        }
    };
    xmlhttp.send(null);
}
get_data();
setInterval(get_data, 5000);

// $.widget("ui.tabulator", $.ui.tabulator, {
//     sorters: {
//         //datetime sort using moment.js
//         datetime:function(a, b){
//             a = moment(a, "DD/MM/YYYY hh:mm:ss");
//             b = moment(b, "DD/MM/YYYY hh:mm:ss");
//             return a - b;
//         },
//     },
// });

