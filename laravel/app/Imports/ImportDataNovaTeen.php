<?php

namespace App\Imports;


use App\Models\CrmParentsModel;
use App\Models\CrmStudentDataModel;
use Maatwebsite\Excel\Concerns\ToCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Session;
use Carbon\Carbon;

class DataCustomerImport implements ToCollection
{
    public function collection(Collection $rows)
    {
    }
}
