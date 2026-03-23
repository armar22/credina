import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:kopi_mas_officer/features/loans/providers/loans_provider.dart';
import 'package:kopi_mas_officer/features/members/providers/members_provider.dart';
import 'package:kopi_mas_officer/features/members/models/member_model.dart';
import 'package:kopi_mas_officer/core/theme/app_theme.dart';

class LoanApplicationCreateScreen extends ConsumerStatefulWidget {
  const LoanApplicationCreateScreen({super.key});

  @override
  ConsumerState<LoanApplicationCreateScreen> createState() => _LoanApplicationCreateScreenState();
}

class _LoanApplicationCreateScreenState extends ConsumerState<LoanApplicationCreateScreen> {
  final _formKey = GlobalKey<FormState>();

  MemberModel? _selectedMember;
  String _loanProductType = 'personal';
  String _interestRateType = 'fixed';
  String _incomeSource = 'employed';

  final _controllers = {
    'loanAmount': TextEditingController(),
    'loanTenureMonths': TextEditingController(),
    'interestRate': TextEditingController(),
    'purposeDescription': TextEditingController(),
    'monthlyIncome': TextEditingController(),
  };

  bool _isLoading = false;

  @override
  void dispose() {
    for (var controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    FocusManager.instance.primaryFocus?.unfocus();

    if (_selectedMember == null) {
      _showFeedbackSnackBar('Please select a member', true);
      return;
    }

    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);

      final loanAmount = double.parse(_controllers['loanAmount']!.text.replaceAll('.', ''));
      final monthlyIncome = double.parse(_controllers['monthlyIncome']!.text.replaceAll('.', ''));
      final tenure = int.parse(_controllers['loanTenureMonths']!.text);
      final interestRate = double.parse(_controllers['interestRate']!.text);

      final loan = LoanApplicationModel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        memberId: _selectedMember!.id,
        loanProductType: _loanProductType,
        loanProductTypeStr: _loanProductType ?? 'personal',
        loanAmount: loanAmount,
        loanTenureMonths: tenure,
        interestRate: interestRate,
        interestRateType: _interestRateType,
        purposeDescription: _controllers['purposeDescription']!.text.trim(),
        incomeSource: _incomeSource,
        monthlyIncome: monthlyIncome,
        applicationStatus: 'submitted',
        submittedAt: DateTime.now(),
      );

      final success = await ref.read(loanApplicationsNotifierProvider.notifier).createLoanApplication(loan);

      if (!mounted) return;
      setState(() => _isLoading = false);

      if (success) {
        _showFeedbackSnackBar('Loan application submitted successfully', false);
        context.go('/loans');
      } else {
        _showFeedbackSnackBar('Failed to submit loan application. Please try again.', true);
      }
    }
  }

  void _showFeedbackSnackBar(String message, bool isError) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(isError ? Icons.error_rounded : Icons.check_circle_rounded, color: Colors.white),
              const SizedBox(width: 12),
              Expanded(child: Text(message, style: const TextStyle(fontWeight: FontWeight.w600))),
            ],
          ),
          backgroundColor: isError ? AppTheme.errorColor : AppTheme.successColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          margin: const EdgeInsets.all(20),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    final membersAsync = ref.watch(membersNotifierProvider);
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: AppTheme.surfaceColor,
      appBar: AppBar(
        title: const Text('New Loan Application'),
        scrolledUnderElevation: 0,
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: colorScheme.primary.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: colorScheme.primary.withOpacity(0.15)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline_rounded, color: colorScheme.primary, size: 20),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Complete the loan application form. All fields are required unless marked optional.',
                        style: TextStyle(
                          fontSize: 13,
                          color: colorScheme.primary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              _FormSectionCard(
                title: 'Select Member',
                icon: Icons.person_rounded,
                color: const Color(0xFF3B82F6),
                children: [
                  membersAsync.when(
                    data: (members) => DropdownButtonFormField<MemberModel>(
                      value: _selectedMember,
                      decoration: const InputDecoration(hintText: 'Choose a member'),
                      items: members.map((m) => DropdownMenuItem(
                        value: m,
                        child: Text('${m.name} (${m.nik})'),
                      )).toList(),
                      onChanged: (value) => setState(() => _selectedMember = value),
                      validator: (v) => v == null ? 'Please select a member' : null,
                    ),
                    loading: () => const Center(child: CircularProgressIndicator()),
                    error: (_, __) => const Text('Failed to load members'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _FormSectionCard(
                title: 'Loan Details',
                icon: Icons.account_balance_wallet_rounded,
                color: const Color(0xFFF59E0B),
                children: [
                  DropdownButtonFormField<String>(
                    value: _loanProductType,
                    decoration: const InputDecoration(labelText: 'Loan Type'),
                    items: const [
                      DropdownMenuItem(value: 'personal', child: Text('Personal Loan')),
                      DropdownMenuItem(value: 'business', child: Text('Business Loan')),
                      DropdownMenuItem(value: 'emergency', child: Text('Emergency Loan')),
                    ],
                    onChanged: (v) => setState(() => _loanProductType = v!),
                  ),
                  const SizedBox(height: 16),
                  _BuildTextField(
                    controller: _controllers['loanAmount']!,
                    label: 'Loan Amount (Rp)',
                    keyboardType: TextInputType.number,
                    validator: (v) {
                      if (v?.isEmpty ?? true) return 'Loan amount is required';
                      final amount = double.tryParse(v!.replaceAll('.', ''));
                      if (amount == null || amount < 100000) return 'Minimum loan is Rp 100,000';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  _BuildTextField(
                    controller: _controllers['loanTenureMonths']!,
                    label: 'Tenure (Months)',
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    validator: (v) {
                      if (v?.isEmpty ?? true) return 'Tenure is required';
                      final months = int.tryParse(v!);
                      if (months == null || months < 1 || months > 60) return 'Tenure must be 1-60 months';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  _BuildTextField(
                    controller: _controllers['interestRate']!,
                    label: 'Interest Rate (%)',
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    validator: (v) {
                      if (v?.isEmpty ?? true) return 'Interest rate is required';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: _interestRateType,
                    decoration: const InputDecoration(labelText: 'Interest Rate Type'),
                    items: const [
                      DropdownMenuItem(value: 'fixed', child: Text('Fixed')),
                      DropdownMenuItem(value: 'floating', child: Text('Floating')),
                    ],
                    onChanged: (v) => setState(() => _interestRateType = v!),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _FormSectionCard(
                title: 'Purpose & Income',
                icon: Icons.work_rounded,
                color: const Color(0xFF10B981),
                children: [
                  _BuildTextField(
                    controller: _controllers['purposeDescription']!,
                    label: 'Purpose of Loan',
                    textCapitalization: TextCapitalization.sentences,
                    maxLines: 2,
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: _incomeSource,
                    decoration: const InputDecoration(labelText: 'Income Source'),
                    items: const [
                      DropdownMenuItem(value: 'employed', child: Text('Employed')),
                      DropdownMenuItem(value: 'self_employed', child: Text('Self Employed')),
                      DropdownMenuItem(value: 'business_owner', child: Text('Business Owner')),
                      DropdownMenuItem(value: 'farmer', child: Text('Farmer')),
                    ],
                    onChanged: (v) => setState(() => _incomeSource = v!),
                  ),
                  const SizedBox(height: 16),
                  _BuildTextField(
                    controller: _controllers['monthlyIncome']!,
                    label: 'Monthly Income (Rp)',
                    keyboardType: TextInputType.number,
                    validator: (v) {
                      if (v?.isEmpty ?? true) return 'Monthly income is required';
                      return null;
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      floatingActionButton: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Colors.grey.shade200)),
        ),
        child: SafeArea(
          child: SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _isLoading ? null : _handleSubmit,
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 18),
              ),
              child: _isLoading
                  ? const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3))
                  : const Text('Submit Application'),
            ),
          ),
        ),
      ),
    );
  }
}

class _FormSectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final List<Widget> children;

  const _FormSectionCard({
    required this.title,
    required this.icon,
    required this.color,
    this.children = const [],
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: AppTheme.elevatedCardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, size: 20, color: color),
              ),
              const SizedBox(width: 16),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          ...children,
        ],
      ),
    );
  }
}

class _BuildTextField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;
  final int maxLines;
  final TextCapitalization textCapitalization;
  final String? Function(String?)? validator;

  const _BuildTextField({
    required this.controller,
    required this.label,
    this.keyboardType,
    this.inputFormatters,
    this.maxLines = 1,
    this.textCapitalization = TextCapitalization.none,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      inputFormatters: inputFormatters,
      maxLines: maxLines,
      textCapitalization: textCapitalization,
      validator: validator,
      decoration: InputDecoration(labelText: label),
    );
  }
}