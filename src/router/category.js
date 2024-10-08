const router = require("express").Router();
const regex = require("./../constant/regx");
const dbHelper = require("./../module/dbHelper");
const tcWrapper = require("../module/tcWrapper"); // trycatch wrapper

const loginCheck = require("../middleware/loginCheck");
const regexCheck = require("../middleware/regexCheck");
const duplicateCheck = require("./../middleware/duplicateCheck");
const roleCheck = require("./../middleware/roleCheck");
const dataCheck = require("./../middleware/dataCheck");

const { nonNegativeNumberRegex, textMax50 } = regex;
const { insertData, readData, updateData, deleteData } = dbHelper;

//카테고리 목록 읽기
router.get("/all",
tcWrapper(
async (req,res) => {
    const sql = "SELECT * FROM category.list ORDER BY idx";
    const rows = await readData(sql);
    res.status(200).send({
        rows
    });
}));
//카테고리 생성 (관리자)
router.post("",
loginCheck,
roleCheck,
regexCheck( [ ["categoryName", textMax50] ] ),
tcWrapper(
async (req,res) => {
    const { categoryName } = req.body;

    const sql = "INSERT INTO category.list(name) VALUES ($1)";
    await insertData(sql,[categoryName]);
    res.status(200).send({});
}));
//카테고리 수정 (관리자)
router.put("/:categoryIdx",
loginCheck,
roleCheck,
regexCheck( [ ["categoryIdx", nonNegativeNumberRegex],["categoryName", textMax50] ] ),
dataCheck( "SELECT name FROM category.list WHERE idx=$1",["categoryIdx"],"존재하지 않는 카테고리입니다." ),
duplicateCheck( "SELECT idx FROM category.list WHERE name=$1","categoryIdx",["categoryName"] ),
tcWrapper(
async (req,res) => {
    const { categoryIdx } = req.params;
    const { categoryName } = req.body;

    const sql = "UPDATE category.list SET name=$1 WHERE idx=$2";
    await updateData(sql,[categoryName,categoryIdx]);
    res.status(200).send({});
}));
//카테고리 삭제 (관리자)
router.delete("/:categoryIdx",
loginCheck,
roleCheck,
regexCheck( [ ["categoryIdx", nonNegativeNumberRegex] ] ),
dataCheck( "SELECT name FROM category.list WHERE idx=$1",["categoryIdx"],"존재하지 않는 카테고리입니다." ),
tcWrapper(
async (req,res) => {
    const { categoryIdx } = req.params;

    const sql = "DELETE FROM category.list WHERE idx=$1";
    await deleteData(sql,[categoryIdx]);
    res.status(200).send({});
}));

module.exports = router;